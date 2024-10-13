class ApiError extends Error{
    constructor(
        statusCode,
        message= "Something went wrong",
        errors=[],
        stack=""
    ) 
    {
        super(message) // TO OVERWRITE THE ERROR MESSAGES
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }


    }
}

export {ApiError}


//ERROR IS A CLASS IN NODE JS