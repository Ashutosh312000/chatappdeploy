
const User = require('../models/user');
const Message = require('../models/message');
const Group = require('../models/group');
const sharp = require('sharp');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const S3Services = require('../services/S3services')






const isstringvalid = (string) => {
    if (string == "" || string == undefined) {
        return true;
    }
    else {
        return false;
    }
}

exports.postmessage = (req, res, next) => {
    const message = req.body.message;
    const groupid = req.body.currentgroup;
    if (isstringvalid(message)) {
        return res.json({ message: 'Fill Up The Blank Spaces' })
    }
    else {
        Message.create({ Message: message, userId: req.user.id, groupId: groupid, IsLink: false })
            .then((message) => {
                res.status(201).json({ message: "Message Is Sent", message })
            })
            .catch(err => {
                console.log(err)
                res.status(400).json({ message: "Something Is Wrong" })
            })
    }
}

exports.postFile = async (req, res) => {
    try {
        const filetype=(req.file.mimetype.split('/'))[0];
        const groupId = req.params.groupId;
        if (req.file != undefined) {
            let type = (req.file.mimetype.split('/'))[1];
            let file = req.file.buffer

            const buffer=await sharp(file).resize({height: 1920,width: 1080,fit:"contain"}).toBuffer();


            const filename = `GroupChat/${new Date()}.${type}`;
            const fileUrl = await S3Services.uploadtoS3(buffer, filename);
            let msg = fileUrl
            const response = await Message.create({ Message: msg, userId: req.user.id, groupId: groupId, IsLink: true, filename:filename,filetype:filetype })


            
            
            res.status(201).json({ message: "file is sent", response});

        }
    }
    catch (error) {
        res.status(400).json({ success: false, message: error });
    }
}

exports.getmessage = async (req, res, next) => {
    try {
        const { lastmessageid, groupid } = req.query

        if (lastmessageid == -1) {
            const messages = await Message.findAll({

                where: { groupId: groupid },

                include: [
                    {
                        model: User,
                        attributes: ['Name']
                    }
                ]
            })
            return res.status(200).json(messages);
        }
        else {
            const messages = await Message.findAll({
                where: { id: { [Op.gt]: lastmessageid }, groupId: groupid },
                include: [
                    {
                        model: User,
                        attributes: ['Name']
                    }
                ]
            })
            return res.status(200).json(messages);
        }

    }
    catch (err) {
        console.log(err)
        res.status(500).json({ err })
    }

}

exports.getadmin = async (req, res, next) => {
    try {
        const groupid = req.query.groupid;

        const groupdetails = await Group.findAll({
            where: { id: groupid },
            attributes: [],
            include: {
                model: User,
                attributes: ['Name', 'id'],
                through: {
                    attributes: ['isAdmin']
                }
            }
        })

        res.json(groupdetails)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: 'some error occured', err })
    }

}









