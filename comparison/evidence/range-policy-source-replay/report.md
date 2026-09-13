# Development comparison

Tempus d91a7ca0e67f7f2cf5661e9674901201e8039610 (working tree modified); gpu-time 0.2.1; CPU; v26.8.1.

- Development fixtures; not an independent holdout or general accuracy estimate.
- Legacy grade scores preview timestamps/recurrence flag only. Value grade additionally checks explicit all-day flags; missing precision is not success. Event text/spans, full RRULE semantics and recurrence beyond the preview remain unscored.
- No browser, GPU, task-completion or performance benchmark.
- Ambiguity and negation follow the explicitly stated Tempus product policy; policy disagreements are not automatically parser bugs.

| Family | Engine | Cases | Matching timestamp preview | Correct rejection | Abstained | Incorrect accepted preview | Exception |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| dates | tempus | 6 | 6 | 0 | 0 | 0 | 0 |
| dates | interpretation | 6 | 6 | 0 | 0 | 0 | 0 |
| dates | gpu | 6 | 6 | 0 | 0 | 0 | 0 |
| arithmetic | tempus | 5 | 5 | 0 | 0 | 0 | 0 |
| arithmetic | interpretation | 5 | 5 | 0 | 0 | 0 | 0 |
| arithmetic | gpu | 5 | 0 | 0 | 4 | 1 | 0 |
| sentences | tempus | 5 | 0 | 0 | 5 | 0 | 0 |
| sentences | interpretation | 5 | 4 | 0 | 1 | 0 | 0 |
| sentences | gpu | 5 | 4 | 0 | 1 | 0 | 0 |
| schedules | tempus | 6 | 0 | 0 | 6 | 0 | 0 |
| schedules | interpretation | 6 | 6 | 0 | 0 | 0 | 0 |
| schedules | gpu | 6 | 4 | 0 | 1 | 1 | 0 |
| recovery | tempus | 9 | 0 | 5 | 4 | 0 | 0 |
| recovery | interpretation | 9 | 0 | 5 | 4 | 0 | 0 |
| recovery | gpu | 9 | 0 | 3 | 1 | 5 | 0 |

## Cases

Legacy timestamp preview grade:

| Case | Tempus v2 | Interpretation | gpu-time |
| --- | --- | --- | --- |
| date-ago | correct | correct | correct |
| date-noon | correct | correct | correct |
| date-friday | correct | correct | correct |
| date-yesterday | correct | correct | correct |
| date-spring-day | correct | correct | correct |
| date-spring-hours | correct | correct | correct |
| math-days-first | correct | correct | abstained |
| math-month-first | correct | correct | incorrect |
| math-step-clamp | correct | correct | abstained |
| math-fraction-week | correct | correct | abstained |
| math-fraction-day | correct | correct | abstained |
| sentence-reminder | abstained | correct | correct |
| sentence-meeting | abstained | correct | correct |
| sentence-question | abstained | correct | correct |
| sentence-correction | abstained | abstained | abstained |
| schedule-weekly | abstained | correct | correct |
| schedule-multiple | abstained | correct | correct |
| schedule-duration | abstained | correct | incorrect |
| schedule-range | abstained | correct | correct |
| schedule-overnight | abstained | correct | correct |
| negative-counts | correct-rejection | correct-rejection | correct-rejection |
| negative-name | correct-rejection | correct-rejection | correct-rejection |
| negative-cancelled | correct-rejection | correct-rejection | incorrect |
| invalid-date | correct-rejection | correct-rejection | correct-rejection |
| ambiguous-clock | abstained | abstained | incorrect |
| ambiguous-numeric | abstained | abstained | incorrect |
| sentence-duration-suffix | abstained | correct | correct |
| schedule-duration-exclusion | abstained | correct | abstained |
| duration-calendar-end-ambiguity | abstained | abstained | incorrect |
| group-equal-clock | abstained | abstained | abstained |
| duration-incomplete | correct-rejection | correct-rejection | incorrect |

## Preview values including date-only meaning

`correct` here requires matching preview timestamps, recurrence flag and all-day flags. It is not complete semantic or export validation. Strict v2 does not expose precision; its matching timestamps are marked `not-exposed` rather than inferring meaning from midnight.

| Family | Engine | Cases | Correct preview value | Correct rejection | Abstained | Incorrect accepted value | Exception | Precision not exposed | Precision not specified |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| dates | tempus | 6 | 0 | 0 | 0 | 0 | 0 | 6 | 0 |
| dates | interpretation | 6 | 6 | 0 | 0 | 0 | 0 | 0 | 0 |
| dates | gpu | 6 | 6 | 0 | 0 | 0 | 0 | 0 | 0 |
| arithmetic | tempus | 5 | 0 | 0 | 0 | 0 | 0 | 5 | 0 |
| arithmetic | interpretation | 5 | 5 | 0 | 0 | 0 | 0 | 0 | 0 |
| arithmetic | gpu | 5 | 0 | 0 | 4 | 1 | 0 | 0 | 0 |
| sentences | tempus | 5 | 0 | 0 | 5 | 0 | 0 | 0 | 0 |
| sentences | interpretation | 5 | 4 | 0 | 1 | 0 | 0 | 0 | 0 |
| sentences | gpu | 5 | 4 | 0 | 1 | 0 | 0 | 0 | 0 |
| schedules | tempus | 6 | 0 | 0 | 6 | 0 | 0 | 0 | 0 |
| schedules | interpretation | 6 | 6 | 0 | 0 | 0 | 0 | 0 | 0 |
| schedules | gpu | 6 | 4 | 0 | 1 | 1 | 0 | 0 | 0 |
| recovery | tempus | 9 | 0 | 5 | 4 | 0 | 0 | 0 | 0 |
| recovery | interpretation | 9 | 0 | 5 | 4 | 0 | 0 | 0 | 0 |
| recovery | gpu | 9 | 0 | 3 | 1 | 5 | 0 | 0 | 0 |

| Case | Tempus v2 value | Interpretation value | gpu-time value |
| --- | --- | --- | --- |
| date-ago | not-exposed | correct | correct |
| date-noon | not-exposed | correct | correct |
| date-friday | not-exposed | correct | correct |
| date-yesterday | not-exposed | correct | correct |
| date-spring-day | not-exposed | correct | correct |
| date-spring-hours | not-exposed | correct | correct |
| math-days-first | not-exposed | correct | abstained |
| math-month-first | not-exposed | correct | incorrect |
| math-step-clamp | not-exposed | correct | abstained |
| math-fraction-week | not-exposed | correct | abstained |
| math-fraction-day | not-exposed | correct | abstained |
| sentence-reminder | abstained | correct | correct |
| sentence-meeting | abstained | correct | correct |
| sentence-question | abstained | correct | correct |
| sentence-correction | abstained | abstained | abstained |
| schedule-weekly | abstained | correct | correct |
| schedule-multiple | abstained | correct | correct |
| schedule-duration | abstained | correct | incorrect |
| schedule-range | abstained | correct | correct |
| schedule-overnight | abstained | correct | correct |
| negative-counts | correct-rejection | correct-rejection | correct-rejection |
| negative-name | correct-rejection | correct-rejection | correct-rejection |
| negative-cancelled | correct-rejection | correct-rejection | incorrect |
| invalid-date | correct-rejection | correct-rejection | correct-rejection |
| ambiguous-clock | abstained | abstained | incorrect |
| ambiguous-numeric | abstained | abstained | incorrect |
| sentence-duration-suffix | abstained | correct | correct |
| schedule-duration-exclusion | abstained | correct | abstained |
| duration-calendar-end-ambiguity | abstained | abstained | incorrect |
| group-equal-clock | abstained | abstained | abstained |
| duration-incomplete | correct-rejection | correct-rejection | incorrect |

Full inputs, expectations, rationale, context and raw responses are in report.json.
