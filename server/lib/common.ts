export const filterAndSortBySubject = (result) => {
  // 1️⃣ Sort alphabetically by subject
  const sorted = result.sort((a, b) => a.subject.localeCompare(b.subject));

  // 2️⃣ Group questions by subject and type
  const grouped: Record<string, Record<string, any[]>> = {};

  sorted.forEach((q) => {
    const { subject, type, ...rest } = q;

    // Initialize object for subject
    if (!grouped[subject]) grouped[subject] = {};

    // Initialize array for type inside subject
    if (!grouped[subject][type]) grouped[subject][type] = [];

    // Push question data into proper type
    grouped[subject][type].push(rest);
  });

  return grouped;
};
