import type { PersonWithExpenses } from "./types";
import { formatDisplayDate, getTodayDateString } from "./helpers";

export async function exportPdf(
  people: PersonWithExpenses[]
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();

  let y = 20;

  doc.setFontSize(18);
  doc.text("Ausgabenuebersicht", 14, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `Erstellt am: ${new Date().toLocaleDateString("de-DE")}`,
    14,
    y
  );
  y += 12;
  doc.setTextColor(0);

  for (const person of people) {
    if (y > 255) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(person.name, 14, y);
    y += 7;
    doc.setFont("helvetica", "normal");

    const sorted = [...person.expenses].sort((a, b) =>
      b.date.localeCompare(a.date)
    );
    const total = sorted.reduce((s, e) => s + e.amount, 0);
    const unsettled = sorted
      .filter((e) => !e.settled)
      .reduce((s, e) => s + e.amount, 0);

    doc.setFontSize(9);
    for (const exp of sorted) {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      const settled = exp.settled ? " [beglichen]" : "";
      const line = `${formatDisplayDate(exp.date)} - ${exp.description}: ${exp.amount.toFixed(2)} EUR${settled}`;
      doc.text(line, 18, y);
      y += 5;
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Gesamt: ${total.toFixed(2)} EUR`, 18, y);
    if (unsettled !== total) {
      y += 5;
      doc.text(`Offen: ${unsettled.toFixed(2)} EUR`, 18, y);
    }
    doc.setFont("helvetica", "normal");
    y += 12;
  }

  doc.save(`ausgaben_${getTodayDateString()}.pdf`);
}
