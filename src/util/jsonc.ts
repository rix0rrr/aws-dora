function parseJsonc(json: string): any {
  // Remove comments and parse JSON
  const cleanedJson = json.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '').trim();
  return JSON.parse(cleanedJson);
}