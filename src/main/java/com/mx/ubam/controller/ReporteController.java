package com.mx.ubam.controller;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "*")
public class ReporteController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // --- ENDPOINT PRINCIPAL QUE GENERA EL PDF ---
    @PostMapping("/generar-pdf")
    public ResponseEntity<byte[]> generarPdfCompleto(@RequestBody Map<String, String> payload) {
        try {
            Document document = new Document(PageSize.A4);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, out);
            document.open();

         // 1. Encabezado con Icono Azul y Logo a 2 colores
            Paragraph titulo = new Paragraph();
            titulo.setAlignment(Element.ALIGN_CENTER);

            // Cargar un icono de tienda azul que coincide con la estética de Abarrotera PRO
            try {
                Image tiendaIcon = Image.getInstance("https://img.icons8.com/ios-filled/100/2563eb/shop.png");
                tiendaIcon.scaleToFit(26, 26);
                titulo.add(new Chunk(tiendaIcon, 0, -3, true)); 
                titulo.add(new Chunk("  ")); 
            } catch (Exception e) {
                System.out.println("Nota: No se pudo cargar el icono de la tienda.");
            }

            // Fuentes de colores
            Font fontAzul = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 26, new BaseColor(37, 99, 235)); 
            Font fontNegro = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 26, new BaseColor(15, 23, 42)); 
            
            titulo.add(new Chunk("Abarrotera", fontAzul));
            titulo.add(new Chunk("PRO", fontNegro));
            document.add(titulo);

            String usuario = payload.getOrDefault("usuario", "Admin");
            String fechaStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            Paragraph subtitulo = new Paragraph("Reporte Operativo y Financiero | Generado por: " + usuario + " | Fecha: " + fechaStr, 
                    FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.DARK_GRAY));
            subtitulo.setAlignment(Element.ALIGN_CENTER);
            subtitulo.setSpacingAfter(20);
            document.add(subtitulo);

            // 2. Gráficas (Recibidas desde el Frontend)
            document.add(new Paragraph("1. Resumen Gráfico", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BaseColor.BLACK)));
            document.add(new Paragraph(" "));

            PdfPTable tablaGraficas1 = new PdfPTable(2);
            tablaGraficas1.setWidthPercentage(100);
            tablaGraficas1.addCell(crearCeldaImagen(payload.get("imgTop"), "Top 5 Más Vendidos"));
            tablaGraficas1.addCell(crearCeldaImagen(payload.get("imgLow"), "Productos con Menos Salida"));
            document.add(tablaGraficas1);

            PdfPTable tablaGraficas2 = new PdfPTable(2);
            tablaGraficas2.setWidthPercentage(100);
            tablaGraficas2.setSpacingAfter(20);
            tablaGraficas2.addCell(crearCeldaImagen(payload.get("imgVentas"), "Tendencia de Ventas"));
            tablaGraficas2.addCell(crearCeldaImagen(payload.get("imgIngresos"), "Ingresos por Día"));
            document.add(tablaGraficas2);

            // SALTO DE PÁGINA
            document.newPage();

            // 3. Tabla de Detalles de Producto
            document.add(new Paragraph("2. Detalle de Ventas por Producto", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BaseColor.BLACK)));
            document.add(new Paragraph(" "));

            PdfPTable tablaProd = new PdfPTable(4);
            tablaProd.setWidthPercentage(100);
            tablaProd.setWidths(new float[]{3f, 2f, 2f, 2f});
            agregarCabeceras(tablaProd, new String[]{"Producto", "Costo Base", "Unidades Vendidas", "Ingreso Total"});

            List<Map<String, Object>> productos = getProductosDetalle();
            for (Map<String, Object> p : productos) {
                tablaProd.addCell(crearCeldaDato(p.get("nombre").toString()));
                tablaProd.addCell(crearCeldaDato("$" + p.get("costo").toString()));
                tablaProd.addCell(crearCeldaDato(p.get("vendidas").toString()));
                tablaProd.addCell(crearCeldaDato("$" + p.get("ingresoTotal").toString()));
            }
            document.add(tablaProd);
            document.add(new Paragraph(" "));

            // 4. Tabla de Ganancias con Sumatoria Anual
            document.add(new Paragraph("3. Reporte Financiero de Ganancias", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BaseColor.BLACK)));
            document.add(new Paragraph(" "));

            PdfPTable tablaGan = new PdfPTable(4);
            tablaGan.setWidthPercentage(100);
            agregarCabeceras(tablaGan, new String[]{"Periodo", "Ingreso Bruto", "Costo Operativo", "Ganancia Neta"});

            List<Map<String, Object>> ganancias = getGanancias();
            double totalBruto = 0.0;
            double totalCosto = 0.0;
            double totalNeto = 0.0;

            for (Map<String, Object> g : ganancias) {
                tablaGan.addCell(crearCeldaDato(g.get("periodo").toString()));
                tablaGan.addCell(crearCeldaDato("$" + g.get("ingresoBruto").toString()));
                tablaGan.addCell(crearCeldaDato("$" + g.get("costoOperativo").toString()));
                tablaGan.addCell(crearCeldaDato("$" + g.get("gananciaNeta").toString()));

                // Acumulamos los totales
                totalBruto += Double.parseDouble(g.get("ingresoBruto").toString());
                totalCosto += Double.parseDouble(g.get("costoOperativo").toString());
                totalNeto += Double.parseDouble(g.get("gananciaNeta").toString());
            }

            // Fila Final de TOTAL AÑO
            tablaGan.addCell(crearCeldaDatoBold("TOTAL DEL AÑO"));
            tablaGan.addCell(crearCeldaDatoBold("$" + String.format(Locale.US, "%.2f", totalBruto)));
            tablaGan.addCell(crearCeldaDatoBold("$" + String.format(Locale.US, "%.2f", totalCosto)));
            tablaGan.addCell(crearCeldaDatoBold("$" + String.format(Locale.US, "%.2f", totalNeto)));

            document.add(tablaGan);
            document.close();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("inline", "Reporte_Abarrotera.pdf");
            return new ResponseEntity<>(out.toByteArray(), headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- MÉTODOS AUXILIARES PARA EL PDF ---
    private PdfPCell crearCeldaImagen(String base64, String titulo) throws Exception {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);

        Paragraph p = new Paragraph(titulo, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12));
        p.setAlignment(Element.ALIGN_CENTER);
        p.setSpacingAfter(5);
        cell.addElement(p);

        if (base64 != null && base64.contains(",")) {
            String base64Data = base64.split(",")[1];
            Image img = Image.getInstance(Base64.getDecoder().decode(base64Data));
            img.scaleToFit(240, 180);
            img.setAlignment(Element.ALIGN_CENTER);
            cell.addElement(img);
        }
        return cell;
    }

    private void agregarCabeceras(PdfPTable table, String[] cabeceras) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE);
        BaseColor bg = new BaseColor(59, 130, 246);
        for (String c : cabeceras) {
            PdfPCell cell = new PdfPCell(new Phrase(c, font));
            cell.setBackgroundColor(bg);
            cell.setPadding(8);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }
    }

    private PdfPCell crearCeldaDato(String texto) {
        PdfPCell cell = new PdfPCell(new Phrase(texto, FontFactory.getFont(FontFactory.HELVETICA, 10)));
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        return cell;
    }

    // Celda para la fila de Totales (Negrita y fondo gris claro)
    private PdfPCell crearCeldaDatoBold(String texto) {
        PdfPCell cell = new PdfPCell(new Phrase(texto, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBackgroundColor(new BaseColor(241, 245, 249)); 
        return cell;
    }

    // --- CONSULTAS SQL ---
    private List<Map<String, Object>> getProductosDetalle() {
        String sql = "SELECT p.nombre_producto AS nombre, p.precio_compra AS costo, " +
                     "IFNULL(SUM(iv.cantidad_vendida), 0) AS vendidas, " +
                     "IFNULL(SUM(iv.cantidad_vendida * p.precio_venta), 0) AS ingresoTotal " +
                     "FROM producto p LEFT JOIN item_venta iv ON p.id_producto = iv.id_producto " +
                     "GROUP BY p.id_producto, p.nombre_producto, p.precio_compra ORDER BY vendidas DESC LIMIT 15";
        return jdbcTemplate.queryForList(sql);
    }

    private List<Map<String, Object>> getGanancias() {
        String sql = "SELECT CONCAT(MONTHNAME(MAX(v.fecha)), ' ', YEAR(MAX(v.fecha))) AS periodo, " +
                     "IFNULL(SUM(iv.cantidad_vendida * p.precio_venta), 0) AS ingresoBruto, " +
                     "IFNULL(SUM(iv.cantidad_vendida * p.precio_compra), 0) AS costoOperativo, " +
                     "IFNULL(SUM(iv.cantidad_vendida * p.precio_venta) - SUM(iv.cantidad_vendida * p.precio_compra), 0) AS gananciaNeta " +
                     "FROM venta v JOIN item_venta iv ON v.id_venta = iv.id_venta JOIN producto p ON iv.id_producto = p.id_producto " +
                     "GROUP BY YEAR(v.fecha), MONTH(v.fecha) ORDER BY YEAR(v.fecha) DESC, MONTH(v.fecha) DESC LIMIT 12";
        return jdbcTemplate.queryForList(sql);
    }
}