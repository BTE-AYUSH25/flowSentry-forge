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
  TextInput,
  Toggle
} from "@forge/react";
import { invoke } from "@forge/bridge";

// 🆕 Rovo AI Icon Component
const RovoIcon = () => (
  <span style={{ marginRight: '8px', fontSize: '18px' }}>🤖</span>
);

// 🆕 Rovo Chat Component
const RovoChat = ({ projectId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input;
    setInput('');
    setIsLoading(true);
    
    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      text: userMessage,
      timestamp: new Date().toISOString()
    }]);
    
    try {
      // Call Rovo AI agent
      const response = await invoke('rovo-query', {
        projectId,
        query: userMessage
      });
      
      // Add AI response
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: response.analysis || response.error || 'No response',
        data: response,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: 'Sorry, I encountered an error. Please try again.',
        error: true,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Button 
        iconBefore={<RovoIcon />}
        onClick={() => setIsOpen(!isOpen)}
        appearance={isOpen ? "primary" : "default"}
      >
        Ask Rovo AI Assistant
      </Button>
      
      {isOpen && (
        <Box 
          padding="space.200" 
          backgroundColor="color.background.neutral" 
          marginTop="space.100"
          borderRadius="4px"
          border="1px solid color.border"
        >
          <Stack space="space.200">
            {/* Chat Messages */}
            <Box style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {messages.length === 0 ? (
                <Box padding="space.200" textAlign="center">
                  <Text color="color.text.subtlest">
                    Ask Rovo about bottlenecks, risks, or improvements...
                  </Text>
                </Box>
              ) : (
                <Stack space="space.100">
                  {messages.map((msg) => (
                    <Box 
                      key={msg.id}
                      padding="space.100"
                      backgroundColor={msg.role === 'user' ? 'color.background.accent.blue.subtle' : 'transparent'}
                      borderRadius="4px"
                    >
                      <Inline alignBlock="center" spread="between">
                        <Text size="small" weight="bold">
                          {msg.role === 'user' ? 'You' : 'Rovo AI'}
                        </Text>
                        <Text size="small" color="color.text.subtlest">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </Inline>
                      <Text>{msg.text}</Text>
                      
                      {msg.data?.suggestedActions && msg.data.suggestedActions.length > 0 && (
                        <Box marginTop="space.050">
                          <Text size="small" weight="medium">Suggested actions:</Text>
                          {msg.data.suggestedActions.slice(0, 2).map((action, idx) => (
                            <Badge key={idx} appearance="success" style={{ marginRight: '4px', marginTop: '4px' }}>
                              {action}
                            </Badge>
                          ))}
                        </Box>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
            
            {/* Input Area */}
            <Stack space="space.100">
              <Inline alignBlock="center">
                <TextInput 
                  placeholder="Type your question about workflow, bottlenecks, risks..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  isDisabled={isLoading}
                  appearance="none"
                  style={{ flex: 1 }}
                />
                <Button 
                  onClick={handleSend}
                  isDisabled={isLoading || !input.trim()}
                  appearance="primary"
                >
                  {isLoading ? <Spinner size="small" /> : 'Ask'}
                </Button>
              </Inline>
              
              <Text size="small" color="color.text.subtlest">
                Try: "Where are bottlenecks?" or "How can we improve?"
              </Text>
            </Stack>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

// Main App Component
const App = () => {
  const context = useProductContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCompetitionFeatures, setShowCompetitionFeatures] = useState(false);

  useEffect(() => {
    if (context?.extension?.issue?.key) {
      invoke("getRiskSnapshot", { issueKey: context.extension.issue.key })
        .then((result) => {
          setData(result);
          setLoading(false);
          
          // Auto-enable competition features in demo mode
          if (result.competitionMode) {
            setShowCompetitionFeatures(true);
          }
        })
        .catch(() => setLoading(false));
    }
  }, [context]);

  if (loading) {
    return (
      <Stack alignBlock="center" space="space.200">
        <Spinner size="large" />
        <Text>🤖 AI Workflow Analysis in Progress...</Text>
        <Text size="small" color="color.text.subtlest">
          FlowSentry + Rovo AI analyzing your workflow
        </Text>
      </Stack>
    );
  }

  if (!data || data.riskScore === 0) {
    return (
      <Stack space="space.200">
        <SectionMessage title="Workflow Analysis Pending" appearance="info">
          <Text>No workflow data available yet. Rovo AI will analyze after first issue transition.</Text>
        </SectionMessage>
        <RovoChat projectId={data?.projectKey || 'default'} />
      </Stack>
    );
  }

  // Risk scoring logic
  const isHighRisk = data.riskScore > 0.7;
  const isMedRisk = data.riskScore > 0.4;
  const appearance = isHighRisk ? "danger" : isMedRisk ? "warning" : "success";
  const riskPercentage = Math.round(data.riskScore * 100);

  return (
    <Stack space="space.300">
      {/* Competition Mode Toggle */}
      {data.competitionMode && (
        <Inline alignBlock="center" spread="between">
          <Badge appearance="success">CodegeistX Submission</Badge>
          <Toggle
            label="Competition Features"
            isChecked={showCompetitionFeatures}
            onChange={() => setShowCompetitionFeatures(!showCompetitionFeatures)}
            size="small"
          />
        </Inline>
      )}

      {/* Header with Risk Score */}
      <Inline spread="between" alignBlock="center">
        <Stack space="space.050">
          <Heading size="medium">Workflow Health</Heading>
          <Text size="small" color="color.text.subtlest">
            Powered by FlowSentry AI
          </Text>
        </Stack>
        <Badge appearance={isHighRisk ? "important" : appearance}>
          {riskPercentage}% Risk
        </Badge>
      </Inline>

      {/* Progress Visualization */}
      <Stack space="space.050">
        <Inline spread="between">
          <Text size="small">Low Risk</Text>
          <Text size="small">High Risk</Text>
        </Inline>
        <ProgressBar value={data.riskScore} appearance={appearance} />
        <Text size="small" color="color.text.subtlest" align="end">
          {riskPercentage >= 70 ? "Immediate attention needed" : 
           riskPercentage >= 40 ? "Monitor closely" : "Healthy workflow"}
        </Text>
      </Stack>

      {/* AI Insights Section */}
      <SectionMessage 
        title={data.hasAI ? "🤖 AI Guardian Insights" : "Workflow Analysis"} 
        appearance={isHighRisk ? "error" : isMedRisk ? "warning" : "info"}
      >
        <Stack space="space.100">
          <Text>{data.explanation?.summary || data.explanation}</Text>
          
          {data.hasAI && data.rovoInsights && (
            <Box padding="space.100" backgroundColor="color.background.accent.blue.subtler" borderRadius="4px">
              <Text size="small" weight="bold">Rovo AI Enhancement:</Text>
              <Text size="small">{data.rovoInsights.analysis}</Text>
            </Box>
          )}
        </Stack>
      </SectionMessage>

      {/* Critical Alerts */}
      {data.alerts && data.alerts.length > 0 && (
        <Stack space="space.100">
          <Text weight="bold">🚨 Critical Observations:</Text>
          {data.alerts.slice(0, 3).map((alert, index) => (
            <Inline key={index} alignBlock="start">
              <Text size="small">⚠️</Text>
              <Text size="small" style={{ flex: 1 }}>{alert}</Text>
            </Inline>
          ))}
        </Stack>
      )}

      {/* Competition Features (Conditional) */}
      {showCompetitionFeatures && (
        <Box 
          padding="space.200" 
          backgroundColor="color.background.accent.purple.subtle" 
          borderRadius="4px"
          borderLeft="4px solid color.border.accent.purple"
        >
          <Stack space="space.100">
            <Inline alignBlock="center">
              <Text weight="bold">🏆 CodegeistX Features:</Text>
            </Inline>
            <Stack space="space.050">
              <Inline>
                <Badge appearance="success">Rovo AI</Badge>
                <Text size="small">Natural language workflow analysis</Text>
              </Inline>
              <Inline>
                <Badge appearance="success">Predictive</Badge>
                <Text size="small">What-if improvement simulations</Text>
              </Inline>
              <Inline>
                <Badge appearance="success">Safe Actions</Badge>
                <Text size="small">Risk-validated workflow changes</Text>
              </Inline>
            </Stack>
          </Stack>
        </Box>
      )}

      {/* Rovo AI Chat Interface */}
      <RovoChat projectId={data.projectKey} />

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
            {data.alerts?.[0] 
              ? `Optimizing "${data.alerts[0].replace('detected at ', '').replace('Bottleneck ', '')}" could reduce risk by ~${Math.round(data.riskScore * 15)}%`
              : 'Ask Rovo for personalized improvement forecasts'}
          </Text>
        </Stack>
      </Box>
    </Stack>
  );
};

ForgeReconciler.render(<App />);
