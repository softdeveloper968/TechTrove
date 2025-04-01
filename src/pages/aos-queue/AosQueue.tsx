import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AosQueueProvider } from "./AosQueueContext";
import AosQueueGrid from "./components/AosQueueGrid";
import AosQueueTaskGrid from "./components/AosQueueTaskGrid";

type AosQueueProps = {};

const AosQueue = (props: AosQueueProps) => {
    const { queueId } = useParams();
    const [showAosQueueGrid, setShowAosQueueGrid] = useState<boolean>(queueId && queueId.length ? false : true);

    useEffect(() => {
        setShowAosQueueGrid(queueId && queueId.length ? false : true);

    }, [queueId]);

    return (
        <AosQueueProvider>
            <div>
                {showAosQueueGrid ? (
                    <AosQueueGrid />
                ) : (
                    <AosQueueTaskGrid />
                )}
            </div>
        </AosQueueProvider>
    );
};

export default AosQueue;