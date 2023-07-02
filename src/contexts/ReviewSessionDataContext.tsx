import React, { createContext, useContext, useEffect, useReducer } from "react";
import { Assignment } from "../types/Assignment";
import { Subject } from "../types/Subject";
import { StudyMaterial } from "../types/MiscTypes";
import {
  ReviewSessionDataState,
  ReviewSessionDataAction,
  ReviewQueueItem,
  ReviewSessionDataDispatch,
} from "../types/ReviewSessionTypes";

import { useStorage } from "../hooks/useStorage";
import { WaniKaniAPI } from "../api/WaniKaniApi";
import {
  flattenData,
  shuffleArray,
  getAudioForReading,
} from "../services/MiscService";
import { setSubjectAvailImgs } from "../services/ImageSrcService";
import {
  findAssignmentWithSubjID,
  findStudyMaterialWithSubjID,
} from "../services/SubjectAndAssignmentService";

const initialState: ReviewSessionDataState = {
  isLoading: false,
  reviewQueue: [],
};

const ReviewSessionDataContext = createContext<{
  queueDataState: ReviewSessionDataState;
  dispatchQueueDataContext: ReviewSessionDataDispatch;
}>({
  queueDataState: initialState,
  dispatchQueueDataContext: () => null,
});

type ProviderProps = {
  children?: React.ReactNode;
};

// TODO: move into different file
const getSubjectData = async (subjIDs: number[]) => {
  try {
    const subjData = await WaniKaniAPI.getSubjectsBySubjIDs(subjIDs);
    let flattened = flattenData(subjData);

    let subjReviewData = flattened.reduce(function (
      filtered: any,
      subject: any
    ) {
      let updatedSubj = setSubjectAvailImgs(subject);
      filtered.push(updatedSubj);
      return filtered;
    },
    []);

    return subjReviewData;
  } catch (error) {
    console.error(
      "OH NO, couldn't get subject data for review session! Error: ",
      error
    );
    return [];
  }
};

// TODO: move into different file
const getStudyMaterials = async (subjIDs: number[]) => {
  try {
    const studyMaterialData = await WaniKaniAPI.getStudyMaterialsBySubjIDs(
      subjIDs
    );
    let flattenedStudyMaterial = flattenData(studyMaterialData);
    return flattenedStudyMaterial;
  } catch (error) {
    console.error(
      "OH NO, couldn't get study material data for review session! Error: ",
      error
    );
    return [];
  }
};

const updateReviewQueueItem = (
  queueItemToUpdate: ReviewQueueItem,
  state: ReviewSessionDataState,
  dispatchContext: ReviewSessionDataDispatch
) => {
  dispatchContext({
    type: "UPDATE_REVIEW_QUEUE_ITEM",
    payload: queueItemToUpdate,
  });
};

const addToReviewQueue = (
  queueItemToAdd: ReviewQueueItem,
  state: ReviewSessionDataState,
  dispatchContext: ReviewSessionDataDispatch
) => {
  dispatchContext({
    type: "ADD_TO_REVIEW_QUEUE",
    payload: queueItemToAdd,
  });
};

const createMeaningAndReadingQueueItems = (
  assignments: Assignment[],
  subjects: Subject[],
  studyMaterials: StudyMaterial[]
): ReviewQueueItem[] => {
  const subjectsWithQueueProps = (subjects as ReviewQueueItem[]).map(
    (subject, index) => {
      let foundAssignment = findAssignmentWithSubjID(assignments, subject);
      let foundStudyMaterial = findStudyMaterialWithSubjID(
        studyMaterials,
        subject
      );

      let primaryReading = subject.readings?.find(
        (reading: any) => reading.primary === true
      );

      let audioUrl =
        subject.pronunciation_audios && primaryReading
          ? getAudioForReading(subject.pronunciation_audios, primaryReading)
          : null;

      // this should always be true since we retrieved the subjects based on the assignments
      let assignment = foundAssignment!;

      return {
        ...subject,
        assignment_id: assignment.id,
        srs_stage: assignment.srs_stage,
        is_reviewed: false,
        itemID: `meaning${index}`,
        is_correct_answer: null,
        meaning_synonyms: foundStudyMaterial
          ? foundStudyMaterial.meaning_synonyms
          : [],
        review_type: "meaning" as const,
        primary_audio_url: audioUrl,
      };
    }
  );

  // adds reading items to queue if the subject has readings (radicals and kana vocab don't)
  const itemsWithReadings = subjectsWithQueueProps.filter(
    (queueItem) => queueItem.readings !== undefined
  );

  const meaningAndReadingQueue = [
    ...subjectsWithQueueProps,
    ...itemsWithReadings.map((itemWithReadings, index) => ({
      ...itemWithReadings,
      review_type: "reading" as const,
      itemID: `reading${index}`,
    })),
  ];

  return meaningAndReadingQueue;
};

const createReviewItems = async (
  assignments: Assignment[],
  subjIDs: number[],
  dispatchContext: ReviewSessionDataDispatch
) => {
  dispatchContext({ type: "REVIEW_QUEUE_LOADING" });
  let subjects = (await getSubjectData(subjIDs)) as Subject[];
  let studyMaterials = (await getStudyMaterials(subjIDs)) as StudyMaterial[];

  let reviewQueueItems = createMeaningAndReadingQueueItems(
    assignments,
    subjects,
    studyMaterials
  );
  // *testing
  console.log(
    "🚀 ~ file: ReviewSessionContext.tsx:158 ~ reviewQueueItems:",
    reviewQueueItems
  );
  // *testing

  //TODO: shuffling, change this based on user-selected sort order when that's implemented
  const shuffledReviewQueueItems = shuffleArray(reviewQueueItems);

  dispatchContext({
    type: "REVIEW_QUEUE_LOADED",
    payload: shuffledReviewQueueItems,
  });
};

const ReviewSessionDataProvider = ({ children }: ProviderProps) => {
  const { getItem, setItem, removeItem } = useStorage();

  // TODO: refactor and then move into its own file
  const reviewQueueReducer = (
    state: ReviewSessionDataState,
    action: ReviewSessionDataAction
  ) => {
    switch (action.type) {
      case "END_REVIEW":
        // TODO: change so setItem called in function, not here
        removeItem("reviewData");
        return { ...state, reviewQueue: [] };
      case "REVIEW_QUEUE_LOADING":
        return { ...state, isLoading: true };
      case "REVIEW_QUEUE_LOADED":
        // TODO: change so setItem not called here since usually pulled from cache
        setItem("reviewQueue", action.payload);
        return { ...state, isLoading: false, reviewQueue: action.payload };
      case "UPDATE_REVIEW_QUEUE_ITEM":
        let lastIndexOfItem =
          state.reviewQueue.length -
          1 -
          state.reviewQueue
            .slice()
            .reverse()
            .findIndex(
              (reviewItem) => reviewItem.itemID === action.payload.itemID
            );
        let updatedQueueItem = Object.assign({}, action.payload);

        return {
          ...state,
          reviewQueue: [
            ...state.reviewQueue.slice(0, lastIndexOfItem),
            updatedQueueItem,
            ...state.reviewQueue.slice(lastIndexOfItem + 1),
          ],
        };
      case "ADD_TO_REVIEW_QUEUE":
        return {
          ...state,
          reviewQueue: [...state.reviewQueue.concat(action.payload)],
        };
      default: {
        throw new Error(`Unhandled action type: ${action.type}`);
      }
    }
  };

  const getReviewQueueFromStorage = async () => {
    dispatchQueueDataContext({ type: "REVIEW_QUEUE_LOADING" });
    const queue = await getItem("reviewQueue");
    dispatchQueueDataContext({
      type: "REVIEW_QUEUE_LOADED",
      payload: queue,
    });
  };

  const [queueDataState, dispatchQueueDataContext] = useReducer(
    reviewQueueReducer,
    initialState
  );

  useEffect(() => {
    getReviewQueueFromStorage();
  }, []);

  const value = { queueDataState, dispatchQueueDataContext };

  return (
    <ReviewSessionDataContext.Provider value={value}>
      {children}
    </ReviewSessionDataContext.Provider>
  );
};

const useReviewSessionData = () => {
  const context = useContext(ReviewSessionDataContext);

  if (!context) {
    throw new Error(
      "useReviewSessionData must be used within a ReviewSessionProvider"
    );
  }

  return context;
};

export {
  ReviewSessionDataContext,
  ReviewSessionDataProvider,
  useReviewSessionData,
  createReviewItems,
  addToReviewQueue,
  updateReviewQueueItem,
};
