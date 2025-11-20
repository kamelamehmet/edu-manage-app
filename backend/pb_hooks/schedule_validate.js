// pb_hooks/schedule_validate.js
// Enforce that only the course teacher or admin can create/update schedule entries for a course.

onRecordCreate("schedule", (e) => {
  const courseId = e.record?.course || e.record?.get?.("course")
  if (!courseId) return e.json(400, { message: "missing course relation" })

  const course = $app.findFirstRecordByData("courses", "id", courseId)
  if (!course) return e.json(404, { message: "course not found" })

  const teacherId = course.teacher || course.get?.("teacher") || course.get?.teacher
  if (e.request?.auth?.id !== teacherId && e.request?.auth?.record?.role !== "admin") {
    return e.json(403, { message: "only the course teacher or admin can create schedule entries for this course" })
  }
})

onRecordUpdate("schedule", (e) => {
  const courseId = e.record?.course || e.record?.get?.("course")
  if (!courseId) return e.json(400, { message: "missing course relation" })

  const course = $app.findFirstRecordByData("courses", "id", courseId)
  if (!course) return e.json(404, { message: "course not found" })

  const teacherId = course.teacher || course.get?.("teacher") || course.get?.teacher
  if (e.request?.auth?.id !== teacherId && e.request?.auth?.record?.role !== "admin") {
    return e.json(403, { message: "only the course teacher or admin can update schedule entries for this course" })
  }
})
