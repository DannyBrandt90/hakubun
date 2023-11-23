import { createAssignmentQueueItems } from "../../../services/SubjectAndAssignmentService";
import { BackToBackChoice } from "../../../components/BackToBackOption/BackToBackOption.types";
import { Assignment } from "../../../types/Assignment";
import { AssignmentQueueItem } from "../../../types/AssignmentQueueTypes";
import { StudyMaterial } from "../../../types/MiscTypes";
import { Subject } from "../../../types/Subject";

// TODO: use areCompleted to generate completed items
export const mockQueueItems = (
  assignments: Assignment[],
  subjects: Subject[],
  studyMaterials: StudyMaterial[],
  backToBackChoice: BackToBackChoice = "disabled",
  areCompleted: boolean
): AssignmentQueueItem[] => {
  const queueItems: AssignmentQueueItem[] = createAssignmentQueueItems(
    assignments,
    subjects,
    studyMaterials,
    backToBackChoice
  );

  return queueItems;
};
