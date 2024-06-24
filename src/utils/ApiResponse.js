class ApiResponse{
    constructor(statusCode,message="Success",data){
        this.statusCode=statusCode
        this.message=message
        this.status=statusCode<400
        this.data=data
    }
}

export { ApiResponse }