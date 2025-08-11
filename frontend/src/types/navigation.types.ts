import { Task } from './task';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  TaskList: undefined;
  AddTask: undefined;
  EditTask: { task: Task };
  TaskDetail: { taskId: string };
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};