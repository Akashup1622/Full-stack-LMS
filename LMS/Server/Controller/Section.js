const Section=require("../Models/Section");
const Course=require("../Models/Course");
const SubSection = require("../Models/SubSection");


exports.createSection=async(req,res)=>{
    try{
        // data fetch
        const {sectionName,courseId}=req.body;
        // data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"missing properties"
            })
        }
        // create section
        const newSection=await Section.create({sectionName});
        // add section to course
        const updateCourseDetails=await Course.findByIdAndUpdate(courseId,{$push:{courseContent:newSection._id}},
            {new:true}).populate("courseContent").exec();
        // hw:use populate to replace sections/ subsection both in updateCourseDetails
    // return response
    return res.status(201).json({
        success:true,
        message:"section created successfully",
        data:updateCourseDetails
    })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"error in creating section"
        })

    }
}