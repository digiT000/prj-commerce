export default function fieldRequiredValidation(
    requiredFields: string[],
    data: any
) {
    const missingFileds = []
    for (const field of requiredFields) {
        if (!data[field]) {
            missingFileds.push(field)
        }
    }
    return missingFileds
}
