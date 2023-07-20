import { IonAlert, IonChip, IonCol, IonGrid, IonRow } from "@ionic/react";
import styled from "styled-components/macro";

export const FullWidthGrid = styled(IonGrid)`
  margin-left: 0;
  margin-right: 0;
  padding-left: 0;
  padding-right: 0;
`;

type RowProps = {
  justify: string;
};

export const SubjRow = styled(IonRow)<RowProps>`
  align-items: center;
  justify-content: ${({ justify }) => justify};
  margin-left: -3px;
`;

export const SubjCol = styled(IonCol)`
  flex-grow: 0;
  flex-shrink: 0;
`;

export const NoteHintContainer = styled.div`
  background-color: var(--light-grey);
  border-radius: 15px;
  padding: 8px;
  margin: 10px 0 5px 0;

  font-size: 0.9rem;
  line-height: 1.5;
`;

export const NoteHintHeading = styled.h6`
  margin: 3px 0;
  font-size: 0.9rem;
  font-weight: 600;
`;

export const IconHeadingContainer = styled.div`
  display: flex;
  align-items: flex-end;
  margin-bottom: 5px;

  ion-icon {
    width: 1.5rem;
    height: 1.5rem;
    margin-right: 5px;
  }
`;

export const AddChip = styled(IonChip)`
  --background: #6930c3;
  --color: white;

  ion-icon {
    color: white;
  }
`;

// TODO: modify so can see textbox before click (has an outline)
export const Alert = styled(IonAlert)`
  @media (prefers-color-scheme: dark) {
    .alert-message {
      color: white;
    }
  }
`;
