import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PaperTableProps {
  papers: any[];
  handleEdit: (id: string) => void;
  handlePreview: (data: any) => void;
  handleDelete: (data: any) => void;
}

const PaperTable: React.FC<PaperTableProps> = ({
  papers,
  handleEdit,
  handlePreview,
  handleDelete,
}) => {
  return (
    <div className="">
      <Card className="shadow-sm border rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold">📘 Papers List</CardTitle>
        </CardHeader>

        <CardContent>
          {papers.length === 0 ? (
            <div className="text-left text-gray-500 py-6">
              No papers available.
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <table className="min-w-full border border-gray-200 rounded-md text-sm">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Sr. No</th>
                    <th className="py-2 px-4 border-b text-left">Title</th>
                    <th className="py-2 px-4 border-b text-left">Grade</th>
                    <th className="py-2 px-4 border-b text-left">Section</th>
                    <th className="py-2 px-4 border-b text-left">Subjects</th>
                    <th className="py-2 px-4 border-b text-left">Created At</th>
                    <th className="py-2 px-4 border-b text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {papers.map((paper: any, index: number) => (
                    <tr
                      key={paper.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-2 px-4 border-b text-left">
                        {index + 1}
                      </td>
                      <td className="py-2 px-4 border-b text-left font-medium">
                        {paper.title}
                      </td>
                      <td className="py-2 px-4 border-b text-left">
                        {paper.gradeId}
                      </td>
                      <td className="py-2 px-4 border-b text-left">
                        {paper.sectionId}
                      </td>
                      <td className="py-2 px-4 border-b text-left">
                        {paper.subjectIds?.slice(0, 2).join(", ")}
                        {paper.subjectIds?.length > 2 ? ", ..." : ""}
                      </td>
                      <td className="py-2 px-4 border-b text-left">
                        {new Date(paper.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 border-b text-left space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(paper.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handlePreview(paper)}
                        >
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleDelete(paper)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaperTable;
