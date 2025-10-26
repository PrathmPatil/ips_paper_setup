import { SelectedQuestionsPreview } from "./SelectedQuestionsPreview";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";

export const PaperPreview = ({
  selectedQuestions,
  setSelectedQuestions,
  isPreview,
  setIsPreview,
  isEdit = false,
  updatePaper
}) => {
  return (
    <Dialog open={isPreview} onOpenChange={setIsPreview}>
      <DialogContent className="h-[600px] w-[800px] flex flex-col">
        {/* HEADER */}
        <DialogHeader>
          <DialogTitle>Preview</DialogTitle>
        </DialogHeader>

        {/* BODY */}
        <div className="flex-1 overflow-auto mt-2 mb-2">
          <SelectedQuestionsPreview
            selectedQuestions={selectedQuestions}
            setSelectedQuestions={setSelectedQuestions}
          />
        </div>

        {/* FOOTER */}
        <DialogFooter className="flex justify-end gap-2">
          {isEdit && <Button onClick={() => updatePaper(selectedQuestions)}>Update Paper</Button>}
          <Button onClick={() => setIsPreview(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
