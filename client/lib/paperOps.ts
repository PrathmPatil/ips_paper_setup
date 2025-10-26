// lib/paperOps.ts
export async function savePaper(payload: any) {
  try {
    const res = await fetch("/api/papers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error("Failed to save paper");
    }
    return await res.json();
  } catch (err) {
    console.error("Save error", err);
    throw err;
  }
}
