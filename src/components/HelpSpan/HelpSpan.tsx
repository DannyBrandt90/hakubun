import { useState } from "react";
import PopoverContent, { PopoverRoot, PopoverTrigger } from "../Popover";
import styled from "styled-components";

const ContainerSpan = styled.span`
  display: inline-block;
  cursor: help;
  padding-right: 3px;
  text-decoration: underline;
  text-decoration-style: dashed;
  text-underline-offset: 4px;
`;

const QuestionMark = styled.span`
  display: inline-block;
  font-size: 1em;
  font-weight: 700;
  color: var(--ion-color-tertiary);
  transform: translate(10%, -30%);
  background-color: transparent;
`;

const ClickableHelp = styled.button`
  all: unset;
  &:focus-visible {
    outline: 2px solid white;
  }
`;

type Props = {
  children: React.ReactNode;
  helpPopoverContents: React.ReactNode;
};

function HelpSpan({ children, helpPopoverContents }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <ContainerSpan>
      <PopoverRoot open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <ClickableHelp>
            {children}
            <QuestionMark>?</QuestionMark>
          </ClickableHelp>
        </PopoverTrigger>
        <PopoverContent isOpen={isOpen}>{helpPopoverContents}</PopoverContent>
      </PopoverRoot>
    </ContainerSpan>
  );
}

export default HelpSpan;
