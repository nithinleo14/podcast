for (const [key, value] of Object.entries(process.env)) {
  if (value && value.length > 20 && /^[A-Za-z0-9_-]+$/.test(value)) {
    console.log(`Found potential key: ${key}`);
  }
}
