import { IonCol, IonRow, IonSkeletonText } from "@ionic/react";
import {
  findAssignmentWithSubjID,
  isAssignmentLocked,
} from "../../services/SubjectAndAssignmentService";
import { useKanjiSubjectsForLvl } from "../../hooks/useKanjiSubjectsForLvl";
import { useKanjiAssignmentsForLvl } from "../../hooks/useKanjiAssignmentsForLvl";
import { Subject } from "../../types/Subject";
import SubjectButton from "../SubjectButton";
import BasicCard from "../BasicCard";
import SrsStageProgressBar from "../SrsStageProgressBar/SrsStageProgressBar";
import Card from "../Card";
import {
  SubjForLvlGrid,
  SubjectButtonAndProgress,
} from "../../styles/BaseStyledComponents";

interface Props {
  level: number | undefined;
}

function KanjiForLvlCard({ level }: Props) {
  const {
    isLoading: subjectsLoading,
    data: subjectsData,
    error: subjectsErr,
  } = useKanjiSubjectsForLvl(level);

  const {
    isLoading: assignmentsLoading,
    data: assignmentsData,
    error: assignmentsErr,
  } = useKanjiAssignmentsForLvl(level);

  let kanjiLoading =
    subjectsLoading || subjectsErr || assignmentsLoading || assignmentsErr;

  //   TODO: create component for loading subject card?
  if (kanjiLoading) {
    return (
      <BasicCard title="" isLoading={true}>
        <SubjForLvlGrid>
          <IonSkeletonText
            animated={true}
            style={{ height: "50px" }}
          ></IonSkeletonText>
        </SubjForLvlGrid>
        <SubjForLvlGrid>
          <IonSkeletonText
            animated={true}
            style={{ height: "50px" }}
          ></IonSkeletonText>
        </SubjForLvlGrid>
        <SubjForLvlGrid>
          <IonSkeletonText
            animated={true}
            style={{ height: "50px" }}
          ></IonSkeletonText>
        </SubjForLvlGrid>
        <SubjForLvlGrid>
          <IonSkeletonText
            animated={true}
            style={{ height: "50px" }}
          ></IonSkeletonText>
        </SubjForLvlGrid>
      </BasicCard>
    );
  }

  // TODO: sort so locked kanji are last
  return (
    <Card title="Kanji" margin="12px 0">
      <SubjForLvlGrid>
        {(subjectsData as Subject[]).map((kanjiItem: any) => {
          return (
            <SubjectButtonAndProgress key={`col_${kanjiItem.id}`}>
              {assignmentsData && (
                <>
                  <SubjectButton
                    subject={kanjiItem}
                    assignment={findAssignmentWithSubjID(
                      assignmentsData,
                      kanjiItem
                    )}
                    btnSize="sm"
                    locked={isAssignmentLocked(assignmentsData, kanjiItem)}
                    useLockedStyle={true}
                    showDetails={false}
                  />
                  <SrsStageProgressBar
                    assignment={findAssignmentWithSubjID(
                      assignmentsData,
                      kanjiItem
                    )}
                    locked={isAssignmentLocked(assignmentsData, kanjiItem)}
                  />
                </>
              )}
            </SubjectButtonAndProgress>
          );
        })}
      </SubjForLvlGrid>
    </Card>
  );
}

export default KanjiForLvlCard;
