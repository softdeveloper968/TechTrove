// useOnClickOutside.ts
import { useEffect } from "react";

/**
 * A custom React hook to handle clicks outside specified elements.
 * @param ref - Reference to the main element to monitor for outside clicks.
 * @param handler - Callback function to be invoked when an outside click is detected.
 * @param includeRef - Optional reference to an element that should not trigger the callback if clicked.
 */
const useOnClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: () => void,
  includeRef?: React.RefObject<HTMLElement> | null
) => {
  useEffect(() => {
    // Event handler function to check if a click occurred outside the specified elements
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the main element (ref) exists and if the click occurred outside it
      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        // Check if includeRef exists and if the click occurred outside it
        (!includeRef ||
          (includeRef.current &&
            !includeRef.current.contains(event.target as Node)))
      ) {
        // Invoke the provided callback when an outside click is detected
        handler();
      }
    };

    // Attach the event listener for mousedown events on the entire document
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup: Remove the event listener when the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, handler, includeRef]); // Re-run the effect when ref, handler, or includeRef change
};

export default useOnClickOutside;
