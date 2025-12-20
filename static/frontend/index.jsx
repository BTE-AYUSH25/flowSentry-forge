import React, { useEffect, useState } from "react";
import ForgeReconciler, {
  Text,
  Stack,
  Button,
  Badge,
  Spinner
} from "@forge/react";
import { invoke } from "@forge/bridge";

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadSnapshot = async () => {
    const snapshot = await invoke("getRiskSnapshot");
    setData(snapshot);
  };

  useEffect(() => {
    loadSnapshot();
  }, []);

  const runDemo = async () => {
    setLoading(true);
    const snapshot = await invoke("runDemoAnalysis");
    setData(snapshot);
    setLoading(false);
  };

  if (!data && !loading) {
    return <Spinner />;
  }

  return (
    <Stack space="space.300">
      <Text weight="bold">FlowSentry Risk Insights</Text>

      <Button appearance="primary" onClick={runDemo} isLoading={loading}>
        ▶ Run Demo Analysis
      </Button>

      {data && (
        <>
          <Text>
            Risk Score{" "}
            <Badge appearance={data.riskScore > 0.5 ? "important" : "success"}>
              {data.riskScore}
            </Badge>
          </Text>

          <Text>{data.explanation}</Text>

          {data.alerts?.length > 0 && (
            <>
              <Text weight="bold">Alerts</Text>
              {data.alerts.map((a, i) => (
                <Text key={i}>⚠️ {a}</Text>
              ))}
            </>
          )}
        </>
      )}
    </Stack>
  );
};

ForgeReconciler.render(<App />);
