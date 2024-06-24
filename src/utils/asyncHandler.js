const asyncHandler = (requestHandler) => {
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err))
    }
}

export {asyncHandler}

// const asyncHandler = () => {}
// const asyncHandler = (fn) => {() => {}} //This a using a function as a parameter and dealing with it

//This is another method creating a rapper function
// const asyncHandler = (fn) => async (req,res,next) => 
//    {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(500 || error.code).json({
//             success:false,
//             message:error.message
//         })
//     }
// }
