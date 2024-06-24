//This is used to handle the error caused 
//Instead of handling the errors everwhere we just call the function
class ApiError extends Error{
    constructor(
        message="Something went wrong",
        errors=[],
        statusCode,
        stack
    ){
        super(message)
        this.statusCode=statusCode
        this.errors=errors
        this.message=message
        this.data=null
        this.success=false
        if(stack){
            this.stack=stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}