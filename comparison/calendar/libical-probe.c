#include "ical.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static void row(icalcomponent *event, const struct icaltime_span *span, void *data) {
    (void)event;
    size_t *count = data;
    if (*count >= 2048) { fprintf(stderr, "Occurrence limit exceeded\n"); exit(2); }
    printf("%s[%lld,%lld]", (*count)++ ? "," : "", (long long)span->start, (long long)span->end);
}
int main(int argc, char **argv) {
    if (argc != 4) { fprintf(stderr, "Usage: probe file.ics start-UTC end-UTC\n"); return 2; }
    FILE *file = fopen(argv[1], "rb");
    if (!file) return 2;
    if (fseek(file, 0, SEEK_END)) return 2;
    long size = ftell(file);
    if (size < 0 || size > 1024 * 1024) return 2;
    rewind(file);
    char *text = calloc((size_t)size + 1, 1);
    if (!text || fread(text, 1, (size_t)size, file) != (size_t)size) return 2;
    fclose(file);
    icalcomponent *calendar = icalparser_parse_string(text);
    free(text);
    if (!calendar || icalcomponent_count_errors(calendar)) { fprintf(stderr, "Parse error\n"); return 2; }
    struct icaltimetype start = icaltime_from_string(argv[2]), end = icaltime_from_string(argv[3]);
    if (icaltime_is_null_time(start) || icaltime_is_null_time(end)) return 2;
    size_t count = 0;
    printf("[");
    for (icalcomponent *event = icalcomponent_get_first_component(calendar, ICAL_VEVENT_COMPONENT);
         event; event = icalcomponent_get_next_component(calendar, ICAL_VEVENT_COMPONENT)) {
        if (icalcomponent_get_first_property(event, ICAL_RECURRENCEID_PROPERTY)) {
            fprintf(stderr, "This probe does not expand detached exceptions\n"); return 2;
        }
        struct icaltimetype dtstart = icalcomponent_get_dtstart(event);
        // The synthetic control must use its embedded definition, not a host TZID substitute.
        icalproperty *property = icalcomponent_get_first_property(event, ICAL_DTSTART_PROPERTY);
        icalparameter *parameter = property ? icalproperty_get_first_parameter(property, ICAL_TZID_PARAMETER) : NULL;
        if (parameter && !strcmp(icalparameter_get_tzid(parameter), "Tempus/Chicago-control")) {
            if (!dtstart.zone || dtstart.zone != icalcomponent_get_timezone(calendar, "Tempus/Chicago-control")) return 2;
        }
        icalcomponent_foreach_recurrence(event, start, end, row, &count);
    }
    printf("]\n");
    icalcomponent_free(calendar);
    return 0;
}
