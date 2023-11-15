import { HttpResponse, http } from "msw";
import { renderWithClient } from "../../testing/test-utils";
import { server } from "../../testing/mocks/server";
import { mockKanjiAssignmentsForLvl1 } from "../../testing/mocks/data/assignments.mock";
import { mockKanjiSubjectsForLvl1 } from "../../testing/mocks/data/subjects.mock";
import { assignmentsEndpoint, subjectsEndpoint } from "../../testing/endpoints";
import LevelProgressBar from ".";

server.use(
  http.get(assignmentsEndpoint, ({ request }) => {
    const url = new URL(request.url);
    const levels = url.searchParams.get("levels");
    const subjTypes = url.searchParams.get("subject_types");
    if (levels != undefined && subjTypes == "kanji") {
      return HttpResponse.json(mockKanjiAssignmentsForLvl1);
    }
  }),
  http.get(subjectsEndpoint, ({ request }) => {
    const url = new URL(request.url);
    const levels = url.searchParams.get("levels");
    const subjTypes = url.searchParams.get("types");
    if (levels != undefined && subjTypes == "kanji") {
      return HttpResponse.json(mockKanjiSubjectsForLvl1);
    }
  })
);

// TODO: add tests to check that the progress bar numbers are rendered correctly
let currentLevel = 1;
test("LevelProgressBar renders without crashing", () => {
  const { baseElement } = renderComponent(currentLevel);
  expect(baseElement).toBeDefined();
});

const renderComponent = (level: number) => {
  return renderWithClient(<LevelProgressBar level={level} />);
};
