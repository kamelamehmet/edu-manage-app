// pb_hooks/grades_validate.js
// Reject grade create/update if the authenticated user isn't the teacher of the referenced course.
// Drop this file into backend/pb_hooks/ and restart PocketBase to enable.

onRecordCreate("grades", (e) => {
  const authId = e.record ? e.request?.auth?.id : null
  const courseId = e.record?.course || e.record?.get?.("course") || e.record?.get?.course
  if (!courseId) {
    return e.json(400, { message: "missing course relation" })
  }

  // find the course record and check teacher field
  const course = $app.findFirstRecordByData("courses", "id", courseId)
  if (!course) return e.json(404, { message: "course not found" })

  const teacherId = course.teacher || course.get?.("teacher") || course.get?.teacher
  if (e.request?.auth?.id !== teacherId && e.request?.auth?.record?.role !== "admin") {
    return e.json(403, { message: "only the course teacher or admin can create grades for this course" })
  }
})

onRecordUpdate("grades", (e) => {
  const courseId = e.record?.course || e.record?.get?.("course")
  if (!courseId) return e.json(400, { message: "missing course relation" })

  const course = $app.findFirstRecordByData("courses", "id", courseId)
  if (!course) return e.json(404, { message: "course not found" })

  const teacherId = course.teacher || course.get?.("teacher") || course.get?.teacher
  if (e.request?.auth?.id !== teacherId && e.request?.auth?.record?.role !== "admin") {
    return e.json(403, { message: "only the course teacher or admin can update grades for this course" })
  }
})
