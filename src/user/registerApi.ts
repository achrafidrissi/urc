import { CustomError } from "../model/CustomError"

export function registerUser(user: { login: string; email: string; password: string },
                             onSuccess: (msg: string) => void,
                             onError: (err: CustomError) => void) {
    fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
    })
        .then(async (response) => {
            if (response.ok) {
                const result = await response.json()
                onSuccess(result.message)
            } else {
                const err = await response.json()
                onError(new CustomError(err.message))
            }
        })
        .catch((e) => onError(new CustomError(e.message)))
}
