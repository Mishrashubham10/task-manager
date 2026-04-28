import { Request, Response } from 'express';
import Task from './task.model';

/*
============== CREATE TASK - CONTROLLER =============
---- FLOW ----
1. Accept task data
2. Validate input
3. Attach logged-in user (owner)
4. Save task
5. Return safe response
*/
export const createTask = async (req: Request, res: Response) => {
  try {
    // 1. Accept task data
    const { title, description, priority, dueDate, tags } = req.body;

    // 2. Validate input
    if (!title) {
      return res.status(400).json({
        message: 'Title is required',
      });
    }

    // 3. Attach logged-in user (owner)
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    // 4 CREATE TASK
    const task = await Task.create({
      title,
      description,
      priority,
      status,
      dueDate,
      tags,
      userId, // 🔐 secure ownership
    });

    // 4. SAFE RESPONSE
    res.status(201).json({
      message: 'Task created successfully',
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        tags: task.tags,
        createdAt: task.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Create task error:', err.message);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

/*
============== GET TASK - CONTROLLER =============
---- FLOW ----
1. TAKE QUERY - REQ.QUERY
2. GET TASK - WITH REQ.USER.USERID
3. VALIDATE USERID
4. APPLY FILTERING AND PAGINATION
5. RETURN SAGE RESPONSE
*/
export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    // QUERY PARAMS
    const {
      status,
      priority,
      search,
      sort = '-createdAt',
      page = '10',
      limit = '10',
    } = req.query;

    // 🔹 BUILD FILTER OBJECT
    const filter: any = {
      userId,
      isDelete: false,
    };

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    // 🔍 SEARCH (title + description)
    if (search) {
      filter.$or = [
        { title: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } },
      ];
    }

    // 🔹 PAGINATION
    const pageNumber = parseInt(page as string, 10) || 1;
    const limitNumber = parseInt(limit as string, 10) || 10;

    const skip = (pageNumber - 1) * limitNumber;

    // 🔹 EXECUTE QUERY
    const tasks = await Task.find(filter)
      .sort(sort as string)
      .skip(skip)
      .limit(limitNumber);

    // 🔹 TOTAL COUNT (for frontend pagination)
    const total = await Task.countDocuments(filter);

    // 🔹 RESPONSE
    return res.status(200).json({
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      tasks,
    });
  } catch (err: any) {
    console.error('Get task error:', err.message);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

/*
============== UPDATE TASK - CONTROLLER =============
---- FLOW ----
1. Accept task data
2. Validate input
3. Attach logged-in user (owner)
4. Save task
5. Return safe response
*/

/*
============== DELETE TASK - CONTROLLER =============
---- FLOW ----
1. Accept task data
2. Validate input
3. Attach logged-in user (owner)
4. Save task
5. Return safe response
*/
