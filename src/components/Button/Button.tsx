import { useRef } from "react";
import { useButton } from "react-aria";
import { AriaButtonProps } from "@react-types/button";
import styled from "styled-components";

type ButtonContainerProps = {
  isPressed: boolean;
  backgroundcolor: string;
  color: string;
};

const ButtonContainer = styled.button<ButtonContainerProps>`
  background-color: ${({ backgroundcolor }) => `${backgroundcolor}`};
  color: ${({ color }) => `${color}`};
  cursor: pointer;
  &:focus {
    outline: 2px solid white;
    --outline: 2px solid white;
  }
`;

interface Props extends AriaButtonProps {
  backgroundColor?: string;
  color?: string;
  className?: string;
}

function Button({
  backgroundColor = "var(--ion-color-primary)",
  color = "white",
  className,
  ...props
}: Props) {
  let { children } = props;
  let ref = useRef(null);
  let { buttonProps, isPressed } = useButton(
    {
      ...props,
      elementType: "button",
    },
    ref
  );

  return (
    <ButtonContainer
      backgroundcolor={backgroundColor}
      color={color}
      {...buttonProps}
      ref={ref}
      isPressed={isPressed}
      tabIndex={0}
      className={className}
    >
      {children}
    </ButtonContainer>
  );
}

export default Button;
