import React, { useEffect, useState } from "react";
import ForgeReconciler, { 
  Text, 
  Stack, 
  ProgressBar, 
  Badge, 
  SectionMessage, 
  useProductContext, 
  Inline, 
  Heading, 
  Box,
  Spinner,
  Button,
  Toggle
} from "@forge/react";
import { invoke } from "@forge/bridge";

const App = () => {
  const context = useProductContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCompetitionFeatures, setShowCompetitionFeatures] = useState(false);
  const [rovoResponse, setRovoResponse] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (context?.extension?.issue?.key) {
        try {
          const result = await invoke('getUIData');
          setData(result);
          
          // Auto-enable competition features in demo mode
          if (result.demoMode || result.competitionMode) {
            setShowCompetitionFeatures(true);
          }
        } catch (error) {
          console.error('Failed to fetch UI data:', error);
          // Set demo data as fallback
          setData({
            issueKey: context.extension.issue.key,
            projectKey: context.extension.issue.key.split('-')[0],
            riskScore: 0.72,
            riskSummary: 'FlowSentry AI Analysis',
            demoMode: true
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [context]);

  const handleRovoQuery = async (queryType) => {
    const projectKey = data?.projectKey || 'DEMO';
    
    let query = '';
    switch(queryType) {
      case 'risk':
        query = 'What is the current workflow risk score?';
        break;
      case 'bottleneck':
        query = 'Where are the bottlenecks?';
        break;
      case 'improve':
        query = 'How can we improve the workflow?';
        break;
    }
    
    try {
      const response = await invoke('rovoQueryHandler', {
        query,
        projectId: projectKey
      });
      setRovoResponse(response);
    } catch (error) {
      setRovoResponse({
        answer: `Rovo AI response (simulated): For ${projectKey}, ${queryType === 'risk' ? 'risk score is 0.72' : queryType === 'bottleneck' ? 'bottlenecks at REVIEW' : 'add parallel review process'}.`,
        suggestedActions: ['Optimize workflow', 'Review automation rules']
      });
    }
  };

  const runLiveAnalysis = async () => {
    if (!data?.projectKey) return;
    
    setLoading(true);
    try {
      const analysis = await invoke('analyzeProjectRisk', {
        projectKey: data.projectKey
      });
      
      if (analysis.success) {
        setData({
          ...data,
          riskScore: analysis.data.riskScore,
          riskSummary: `Live Analysis: ${analysis.data.riskLevel} risk`,
          demoMode: false
        });
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Stack alignBlock="center" space="space.200">
        <Spinner size="large" />
        <Text>🤖 FlowSentry AI Analyzing Workflow...</Text>
        <Text size="small" color="color.text.subtlest">
          Connecting to Jira data
        </Text>
      </Stack>
    );
  }

  if (!data) {
    return (
      <SectionMessage title="No Data Available" appearance="warning">
        <Text>Unable to load workflow data. Please try again or check permissions.</Text>
      </SectionMessage>
    );
  }

  // Risk scoring logic
  const isHighRisk = data.riskScore > 0.7;
  const isMedRisk = data.riskScore > 0.4;
  const appearance = isHighRisk ? "danger" : isMedRisk ? "warning" : "success";
  const riskPercentage = Math.round(data.riskScore * 100);

  return (
    <Stack space="space.300">
      {/* Competition Mode & Status Badges */}
      <Inline alignBlock="center" spread="between">
        <Inline alignBlock="center">
          {data.demoMode ? (
            <Badge appearance="removed" iconBefore="🏆">Demo Mode</Badge>
          ) : (
            <Badge appearance="success" iconBefore="✅">Live Jira Data</Badge>
          )}
          <Badge appearance="success">CodegeistX Submission</Badge>
        </Inline>
        <Toggle
          label="Competition Features"
          isChecked={showCompetitionFeatures}
          onChange={() => setShowCompetitionFeatures(!showCompetitionFeatures)}
          size="small"
        />
      </Inline>

      {/* Header */}
      <Stack space="space.100">
        <Inline spread="between" alignBlock="center">
          <Heading size="medium">FlowSentry AI</Heading>
          <Badge appearance={isHighRisk ? "important" : appearance}>
            {riskPercentage}% Risk
          </Badge>
        </Inline>
        <Text size="small" color="color.text.subtlest">
          {data.projectKey} • {data.currentStatus || 'Issue Analysis'}
        </Text>
      </Stack>

      {/* Progress Visualization */}
      <Stack space="space.050">
        <Inline spread="between">
          <Text size="small">Low Risk</Text>
          <Text size="small">High Risk</Text>
        </Inline>
        <ProgressBar value={data.riskScore} appearance={appearance} />
        <Text size="small" color="color.text.subtlest" align="end">
          {riskPercentage >= 70 ? "🚨 Immediate attention needed" : 
           riskPercentage >= 40 ? "⚠️ Monitor closely" : "✅ Healthy workflow"}
        </Text>
      </Stack>

      {/* AI Insights */}
      <SectionMessage 
        title={data.demoMode ? "🤖 AI Insights (Demo)" : "🤖 AI Live Analysis"} 
        appearance={isHighRisk ? "error" : isMedRisk ? "warning" : "info"}
      >
        <Stack space="space.100">
          <Text>{data.riskSummary}</Text>
          {data.timeInState && (
            <Text size="small">Time in current state: <Text weight="semibold">{data.timeInState}</Text></Text>
          )}
          
          <Button 
            onClick={runLiveAnalysis}
            appearance="primary"
            isDisabled={loading}
          >
            {loading ? <Spinner size="small" /> : 'Run Live Analysis'}
          </Button>
        </Stack>
      </SectionMessage>

      {/* Rovo AI Interaction */}
      <Box padding="space.200" backgroundColor="color.background.neutral" borderRadius="4px">
        <Stack space="space.150">
          <Inline alignBlock="center">
            <Text weight="bold">🤖 Ask Rovo AI</Text>
            <Badge appearance="success">Powered by Atlassian</Badge>
          </Inline>
          
          <Inline space="space.100">
            <Button onClick={() => handleRovoQuery('risk')}>Risk Score?</Button>
            <Button onClick={() => handleRovoQuery('bottleneck')}>Bottlenecks?</Button>
            <Button onClick={() => handleRovoQuery('improve')}>Improve?</Button>
          </Inline>
          
          {rovoResponse && (
            <Box padding="space.100" backgroundColor="color.background.accent.blue.subtle" borderRadius="4px">
              <Text size="small" weight="bold">Rovo AI Response:</Text>
              <Text>{rovoResponse.answer}</Text>
              {rovoResponse.suggestedActions && (
                <Box marginTop="space.050">
                  <Text size="small">Suggested actions:</Text>
                  <Inline space="space.050" wrap="wrap">
                    {rovoResponse.suggestedActions.slice(0, 3).map((action, idx) => (
                      <Badge key={idx} appearance="success">{action}</Badge>
                    ))}
                  </Inline>
                </Box>
              )}
            </Box>
          )}
          
          <Text size="small" color="color.text.subtlest">
            Try: "Hey Rovo, ask FlowSentry to analyze bottlenecks in {data.projectKey}"
          </Text>
        </Stack>
      </Box>

      {/* Competition Features */}
      {showCompetitionFeatures && (
        <Box 
          padding="space.200" 
          backgroundColor="color.background.accent.purple.subtle" 
          borderRadius="4px"
          borderLeft="4px solid color.border.accent.purple"
        >
          <Stack space="space.100">
            <Inline alignBlock="center">
              <Text weight="bold">🏆 CodegeistX Features</Text>
            </Inline>
            <Stack space="space.050">
              <Inline>
                <Badge appearance="success">Rovo AI Agent</Badge>
                <Text size="small">Natural language workflow analysis</Text>
              </Inline>
              <Inline>
                <Badge appearance="success">Forge Integration</Badge>
                <Text size="small">Real-time Jira data analysis</Text>
              </Inline>
              <Inline>
                <Badge appearance="success">Predictive Engine</Badge>
                <Text size="small">What-if simulations & forecasts</Text>
              </Inline>
            </Stack>
          </Stack>
        </Box>
      )}

      {/* What-If Forecast */}
      <Box 
        padding="space.150" 
        backgroundColor="color.background.accent.blue.subtle" 
        borderRadius="4px"
      >
        <Stack space="space.050">
          <Inline alignBlock="center">
            <Text>🔮</Text>
            <Text weight="bold">AI Forecast</Text>
          </Inline>
          <Text size="small">
            Optimizing the main bottleneck could reduce risk by ~{Math.round(data.riskScore * 20)}% 
            and improve throughput by {Math.round(data.riskScore * 15)}%.
          </Text>
        </Stack>
      </Box>
    </Stack>
  );
};

ForgeReconciler.render(<App />);