import { Request, Response } from 'express'
import mongoose from 'mongoose'

import { Group } from '../../model/home-hub/group'
import { User } from '../../model/home-hub/user'

async function groupCreate(req: Request, res: Response) {
  try {
    const { name } = req.body

    if (!name) {
      return res.status(400).json({ message: 'name is required' })
    }

    const group = new Group({
      ...req.body,
      owner: req.user?.id
    })
    await group.save()

    return res.json({ data: group })
  } catch (error: any) {
    return res.status(500).json({ message: error.message })
  }
}

async function groupList(req: Request, res: Response) {
  try {
    const userId = new mongoose.Types.ObjectId(`${req.user?.id}`)
    const populateFields = req.query.populateFields
      ? (req.query.populateFields as string).split(',')
      : [];

    const query = Group.find({
      $or: [
        { owner: userId }, // Kullanıcı grubun sahibi
        {
          'members.user': userId, // Kullanıcı üye
          'members.status': { $ne: 'pending' } // Durumu 'pending' değil
        }
      ],
    });

    if (populateFields.includes('owner')) {
      query.populate('owner');
    }

    if (populateFields.includes('invitedBy')) {
      query.populate('invitedBy');
    }

    if (populateFields.includes('members.user')) {
      query.populate({
        path: 'members.user',
        select: 'name email' // Burada sadece gerekli alanları döndürebilirsiniz
      });
    }

    const response = await query.exec();

    return res.response({
      status: 'success',
      code: 200,
      message: 'Group list fetched successfully',
      data: response,
    })
  } catch (error: any) {
    console.log('error', error)
    return res.status(500).json({ message: error.message })
  }
}

async function groupGet(req: Request, res: Response) {
  try {
    const userId = new mongoose.Types.ObjectId(`${req.user?.id}`)
    const group = await Group.findOne({
      _id: req.params.id,
      $or: [{ ownerId: userId }, { 'members.userId': userId }]
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    return res.json({ data: group });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function groupUpdate(req: Request, res: Response) {
  try {
    const allowedUpdates = ['name', 'members', 'ownerId'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user?.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    return res.json({ data: group });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}


async function groupDelete(req: Request, res: Response) {
  try {
    const group = await Group.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user?.id
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    return res.json({ message: 'Group deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function groupInviteList(req: Request, res: Response) {
  try {
    const userId = new mongoose.Types.ObjectId(`${req.user?.id}`);

    const groups = await Group.find({
      'members.user': userId,
      'members.status': 'pending'
    }).populate({
      path: 'members.user',
      select: 'name email'
    }).populate({
      path: 'owner',
      select: 'name email'
    });

    return res.response({
      status: 'success',
      code: 200,
      message: 'Invites fetched successfully',
      data: groups,
    });
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: 'Error fetching invites',
      details: error
    })
  }
}

async function groupInviteSend(req: Request, res: Response) {
  try {
    const targetUser = await User.findOne({ email: req.body.email });
    if (!targetUser) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'User not found',
      });
    }

    const group = await Group.findOne({
      _id: req.params.id,
      owner: req.user?.id
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.members.find((m) => m.user == targetUser.id)) {
      return res.status(400).json({ message: 'User is already a member or invited' });
    }

    group.members.push({
      user: targetUser.id,
      status: 'pending',
      invitedBy: req.user?.id
    })

    await group.save()

    return res.json({ message: 'Invite sent successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function groupInviteAnswer(req: Request, res: Response) {
  try {
    const { status } = req.body
    console.log({ status, id: req.params })
    const userId = new mongoose.Types.ObjectId(`${req.user?.id}`)
    const group = await Group.findOne({
      _id: req.params.id,
      $or: [{ owner: userId }, { 'members.user': userId }]
    })

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const member = group.members.find((m) => m.user == req.user?.id)
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (status === "accepted") {
      member.status = status
      await group.save()
      return res.json({ message: 'Invite accepted successfully' });
    } else if (status === "declined") {
      group.members.pull({ userId: req.user?.id })
      await group.save()
      return res.json({ message: 'Invite rejected successfully' });
    }

  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}


export { groupCreate, groupDelete, groupGet, groupList, groupUpdate, groupInviteAnswer, groupInviteList, groupInviteSend };
