import React, { useState, useRef, useEffect, ReactNode, MutableRefObject } from "react";
import { cn } from "@/helpers/common.helper";

type Props = {
  defaultHeight?: string;
  verticalOffset?: number;
  horizontalOffset?: number;
  root?: MutableRefObject<HTMLElement | null>;
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
  classNames?: string;
  placeholderChildren?: ReactNode;
  defaultValue?: boolean;
  useIdletime?: boolean;
};

const RenderIfVisible: React.FC<Props> = (props) => {
  const {
    defaultHeight = "300px",
    root,
    verticalOffset = 50,
    horizontalOffset = 0,
    as = "div",
    children,
    classNames = "",
    placeholderChildren = null, //placeholder children
    defaultValue = false,
    useIdletime = false,
  } = props;
  const [shouldVisible, setShouldVisible] = useState<boolean>(defaultValue);
  const placeholderHeight = useRef<string>(defaultHeight);
  const intersectionRef = useRef<HTMLElement | null>(null);

  const isVisible = shouldVisible;

  // Set visibility with intersection observer
  useEffect(() => {
    if (intersectionRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          //DO no remove comments for future
          if (typeof window !== undefined && window.requestIdleCallback && useIdletime) {
            window.requestIdleCallback(() => setShouldVisible(entries[entries.length - 1].isIntersecting), {
              timeout: 300,
            });
          } else {
            setShouldVisible(entries[entries.length - 1].isIntersecting);
          }
        },
        {
          root: root?.current,
          rootMargin: `${verticalOffset}% ${horizontalOffset}% ${verticalOffset}% ${horizontalOffset}%`,
        }
      );
      observer.observe(intersectionRef.current);
      return () => {
        if (intersectionRef.current) {
          // eslint-disable-next-line react-hooks/exhaustive-deps
          observer.unobserve(intersectionRef.current);
        }
      };
    }
  }, [intersectionRef, children, root, verticalOffset, horizontalOffset]);

  //Set height after render
  useEffect(() => {
    if (intersectionRef.current && isVisible) {
      placeholderHeight.current = `${intersectionRef.current.offsetHeight}px`;
    }
  }, [isVisible, intersectionRef]);

  const child = isVisible ? <>{children}</> : placeholderChildren;
  const style: { width?: string; height?: string } = isVisible
    ? {}
    : { height: placeholderHeight.current, width: "100%" };
  const className = isVisible || placeholderChildren ? classNames : cn(classNames, "bg-custom-background-80");

  return React.createElement(as, { ref: intersectionRef, style, className }, child);
};

export default RenderIfVisible;
