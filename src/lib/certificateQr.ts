import qrcode from 'qrcode-generator'

/**
 * QR autocontenido para el certificado: se genera en el cliente y viaja dentro
 * del propio SVG, así que funciona también al imprimir sin conexión.
 *
 * Nivel de corrección `L`: la URL de verificación es corta y así caben menos
 * módulos (29 frente a 33), manteniendo el contraste negro/blanco y 2 módulos
 * de margen silencioso. Eso permite dibujarlo pequeño sin perder lectura.
 */
export function certificateQrSvg(url: string): string {
  const qr = qrcode(0, 'L')
  qr.addData(url, 'Byte')
  qr.make()
  return qr
    .createSvgTag({ cellSize: 1, margin: 2, scalable: true })
    .replace('<svg ', '<svg shape-rendering="crispEdges" ')
}
