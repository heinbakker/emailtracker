export function getButtonStyles(style: string, color: string): string {
  const baseStyles = 'text-decoration:none; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif;';
  
  switch (style) {
    case 'modern':
      return `${baseStyles} font-size:24px;`;
    case 'minimal':
      return `${baseStyles} font-size:20px;`;
    case 'classic':
      return `${baseStyles} font-size:28px;`;
    default:
      return baseStyles;
  }
}