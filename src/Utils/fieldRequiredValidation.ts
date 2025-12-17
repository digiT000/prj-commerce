export default function fieldRequiredValidation(
    requiredFields: string[],
    data: Record<string, unknown>
) {
    const missingFileds = []
    for (const field of requiredFields) {
        if (!data[field]) {
            missingFileds.push(field)
        }
    }
    return missingFileds
}
