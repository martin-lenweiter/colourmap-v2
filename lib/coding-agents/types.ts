export type AgentMode = 'plan' | 'build' | 'fix' | 'review';

export type AgentEvent =
  | { type: 'output'; stream: 'stdout' | 'stderr'; text: string }
  | { type: 'error'; message: string }
  | { type: 'file_changed'; path: string }
  | { type: 'command_started'; command: string; args: string[] }
  | { type: 'command_finished'; exitCode: number | null }
  | { type: 'permission_request'; message: string }
  | { type: 'mission_complete'; success: boolean };

export type RunMissionInput = {
  projectPath: string;
  prompt: string;
  mode?: AgentMode;
};

export interface CodingAgentAdapter {
  id: string;
  name: string;
  isAvailable(): Promise<boolean>;
  runMission(input: RunMissionInput): AsyncGenerator<AgentEvent>;
}
