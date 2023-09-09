import { useState } from "react";
import { useNavigate } from "react-router";
import { useNumLessons } from "../../hooks/useLessonNum";
import { setBtnBackground } from "../../services/ImageSrcService";
import Toast from "../Toast";
import {
  BaseReviewLessonButton,
  BaseReviewLessonButtonBadge,
  BaseReviewLessonButtonSkeleton,
} from "../../styles/SubjectButtonsStyled";
import styled from "styled-components";

const LessonsButtonStyled = styled(BaseReviewLessonButton)`
  background-color: var(--wanikani-lesson);
  &:focus {
    outline: 2px solid white;
    --outline: 2px solid white;
  }
`;

const LessonButtonSkeleton = styled(BaseReviewLessonButtonSkeleton)`
  --background: var(--wani-kani-pink-rgba);
  --background-rgb: var(--wani-kani-pink-rgb);
`;

type Props = {
  level: number;
};

// TODO: if no lessons available, show message on click
function LessonsButton({ level }: Props) {
  const navigate = useNavigate();
  const [displayToast, setDisplayToast] = useState<boolean>(false);

  // TODO: change so getting lessons and then just use number of those for count
  const {
    isLoading: numLessonsLoading,
    data: numLessons,
    error: lessonErr,
  } = useNumLessons({ level: level });

  if (numLessonsLoading || lessonErr) {
    return <LessonButtonSkeleton animated={true}></LessonButtonSkeleton>;
  }

  // TODO: display different message if lessons available but trial and at max level
  const onLessonBtnClick = () => {
    if (numLessons === 0 || numLessons === undefined) {
      setDisplayToast(true);
    } else {
      navigate("/lessons/settings");
    }
  };

  return (
    <>
      <LessonsButtonStyled
        color="clear"
        expand="block"
        title="Lessons"
        onClick={onLessonBtnClick}
        style={{
          backgroundImage: `url(${setBtnBackground({
            btnType: "lessons",
            numItems: numLessons,
          })})`,
        }}
      >
        <p>Lessons</p>
        <BaseReviewLessonButtonBadge>
          {numLessons ? numLessons : 0}
        </BaseReviewLessonButtonBadge>
      </LessonsButtonStyled>
      <Toast
        open={displayToast}
        setOpen={setDisplayToast}
        title="No lessons available!"
        content="Looks like you don't have any lessons right now, work on reviews if you have some available :)"
      ></Toast>
    </>
  );
}

export default LessonsButton;
