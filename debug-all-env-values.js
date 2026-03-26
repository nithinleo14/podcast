for (const [key, value] of Object.entries(process.env)) {
  const sanitizedValue = value ? (value.length > 4 ? value.substring(0, 4) + '...' : value) : 'EMPTY';
  console.log(`${key}: ${sanitizedValue}`);
}
