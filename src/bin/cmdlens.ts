export async function main(): Promise<void> {
  process.stdout.write("cmdlens\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
