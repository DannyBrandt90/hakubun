import { BottomSheetSubjectProps } from "../../types/ReviewSessionTypes";
import { Subject, Vocabulary } from "../../types/Subject";
import {
  SubjDetailSection,
  SubjDetailSubHeading,
} from "../subject-details/SubjectDetailsStyled";
import { SubjectMeanings } from "../SubjectMeanings";
import { KanjiUsedInVocab } from "../subjects/KanjiUsedInVocab";
import PartsOfSpeech from "../PartsOfSpeech/PartsOfSpeech";
import { VocabMeaningExplanation } from "../subjects/VocabMeaningExplanation";
import { VocabReadingExplanation } from "../subjects/VocabReadingExplanation";
import { VocabReadings } from "../subject-details/VocabReadings";
import { ContextSentences } from "../ContextSentences";

import styled from "styled-components/macro";

const ReadingHeading = styled(SubjDetailSubHeading)`
  margin-bottom: 0;
`;

const VocabReadingSection = styled(SubjDetailSection)`
  margin-bottom: 0;
`;

function VocabBottomSheet({
  reviewItem,
  selectedSegment,
}: BottomSheetSubjectProps) {
  let findComponents =
    reviewItem.component_subject_ids &&
    reviewItem.component_subject_ids.length !== 0;

  return (
    <>
      {selectedSegment === "breakdown" && findComponents && (
        <KanjiUsedInVocab
          kanjiIDs={reviewItem.component_subject_ids!}
          displayQuestionTxt={true}
        />
      )}
      {selectedSegment === "meaning" && (
        <>
          <SubjDetailSection>
            <SubjectMeanings
              subject={reviewItem as Subject}
              showPrimaryMeaning={true}
            />
          </SubjDetailSection>
          <SubjDetailSection>
            <PartsOfSpeech vocab={reviewItem as Vocabulary} />
          </SubjDetailSection>
          <VocabMeaningExplanation vocab={reviewItem as Vocabulary} />
        </>
      )}
      {selectedSegment === "reading" && (
        <>
          <VocabReadingSection>
            <ReadingHeading>Vocab Reading</ReadingHeading>
            <VocabReadings
              vocab={reviewItem as Vocabulary}
              hideReadingTxt={true}
            />
          </VocabReadingSection>
          <VocabReadingExplanation vocab={reviewItem as Vocabulary} />
          {reviewItem.context_sentences && (
            <ContextSentences sentences={reviewItem.context_sentences} />
          )}
        </>
      )}
    </>
  );
}

export default VocabBottomSheet;