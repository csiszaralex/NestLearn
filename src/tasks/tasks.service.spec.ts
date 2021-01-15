import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { TaskRepository } from './task.repository';
import { TasksService } from './tasks.service';

const mockUser = { id: 3, username: 'Test user' };
const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

describe('TasksService', () => {
  let tasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TaskRepository,
          useFactory: mockTaskRepository,
        },
      ],
    }).compile();

    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('gets all tasks successfully', async () => {
      taskRepository.getTasks.mockResolvedValue('someValue'); //. Visszatér a promis "jó" részébel
      const filters: getTasksFilterDto = { status: TaskStatus.IN_PROGRESS, search: 'some search query' };

      expect(taskRepository.getTasks).not.toHaveBeenCalled();
      const result = await tasksService.getTasks(filters, mockUser);
      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('someValue');
    });
  });
  describe('getTaskById', () => {
    it('Get 1 task successfully', async () => {
      const mockTask = { title: 'Test task', descption: 'Testdesc' };
      taskRepository.findOne.mockResolvedValue(mockTask);

      const res = await tasksService.getTaskById(1, mockUser);
      expect(res).toEqual(mockTask);
      expect(taskRepository.findOne).toHaveBeenCalledWith({ where: { id: 1, userId: mockUser.id } });
    });
    it('Throw notFound error', () => {
      taskRepository.findOne.mockResolvedValue(null);
      expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(NotFoundException);
    });
  });
  describe('createTask', () => {
    it('Create successfully', async () => {
      const mockTask = { title: 'Test task', descption: 'Testdesc' };
      taskRepository.createTask.mockResolvedValue(mockTask);

      expect(taskRepository.createTask).not.toHaveBeenCalled();
      const res = await tasksService.createTask(mockTask, mockUser);
      expect(taskRepository.createTask).toHaveBeenCalledWith(mockTask, mockUser);
      expect(res).toEqual(mockTask);
    });
  });
  describe('deleteTask', () => {
    it('Delete Successfully', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 1 });

      expect(taskRepository.delete).not.toHaveBeenCalled();
      await tasksService.deleteTask(5, mockUser);
      expect(taskRepository.delete).toHaveBeenCalledWith({ id: 5, userId: mockUser.id });
    });
    it('Throw notFound error', () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 });
      expect(tasksService.deleteTask(1, mockUser)).rejects.toThrow(
        new NotFoundException('Task with "1" id not found!'),
      );
    });
  });
  describe('updateTaskStatus', () => {
    it('Update successfully', async () => {
      const save = jest.fn().mockResolvedValue(true);
      tasksService.getTaskById = jest.fn().mockResolvedValue({
        status: TaskStatus.OPEN,
        save,
      });

      expect(tasksService.getTaskById).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();
      const res = await tasksService.updateTaskStatus(1, TaskStatus.DONE, mockUser);
      expect(tasksService.getTaskById).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
      expect(res.status).toEqual(TaskStatus.DONE);
    });
  });
});
