import React from "react";
import { EvictionAnswerProvider } from "./EvictionAnswerContext";
import EvictionAnswerScreen from "./components/EvictionAnswerScreen";

type EvictionAnswerProps = {};

const EvictionAnswer = (props: EvictionAnswerProps) => {
    return (
        <EvictionAnswerProvider>
            <div>
                <EvictionAnswerScreen />
            </div>
        </EvictionAnswerProvider>
    );
};

export default EvictionAnswer;