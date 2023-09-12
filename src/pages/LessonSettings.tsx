import { IonButtons, IonHeader, IonToolbar } from "@ionic/react";
import { useUserSettingsStore } from "../stores/useUserSettingsStore";
import { useLessons } from "../hooks/useLessons";
import AnimatedPage from "../components/AnimatedPage";
import ShiftBy from "../components/ShiftBy";
import BackButton from "../components/BackButton/BackButton";
import AssignmentSettings from "../components/AssignmentSettings";
import { MainContent, SettingsTitle } from "../styles/BaseStyledComponents";
import styled from "styled-components";

const Page = styled(AnimatedPage)`
  background-color: var(--dark-greyish-purple);
`;

const HeaderContainer = styled(IonHeader)`
  background: var(--wanikani-lesson);
  --ion-toolbar-background: var(--wanikani-lesson);
  padding: 10px 0;
  box-shadow: none;
`;

function LessonSettings() {
  const {
    isLoading: lessonsLoading,
    data: lessonsData,
    error: lessonsErr,
  } = useLessons();

  const lessonBatchSize = useUserSettingsStore.use.lessonBatchSize();

  return (
    <Page>
      <HeaderContainer>
        <IonToolbar>
          <ShiftBy x={10}>
            <IonButtons slot="start">
              <BackButton />
            </IonButtons>
          </ShiftBy>
          <SettingsTitle>Lesson Settings</SettingsTitle>
        </IonToolbar>
      </HeaderContainer>
      <MainContent>
        {lessonsLoading && <h1>Loading...</h1>}
        {!lessonsLoading && lessonsErr && <div>{`Error: ${lessonsErr}`}</div>}
        {!lessonsLoading && !lessonsErr && lessonsData && (
          <AssignmentSettings
            settingsType="lessons"
            assignmentData={lessonsData}
            defaultBatchSize={lessonBatchSize}
          />
        )}
      </MainContent>
    </Page>
  );
}

export default LessonSettings;
