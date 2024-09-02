import pick from "lodash/pick";
import { TIssue } from "@plane/types";
import { rootStore } from "@/lib/store-context";
import { updateIssue } from "./load-issues";

export const log = console.log;

// export const log = () => {};

export const updatePersistentLayer = async (issueIds: string | string[]) => {
  if (typeof issueIds === "string") {
    issueIds = [issueIds];
  }
  issueIds.forEach((issueId) => {
    const issue = rootStore.issue.issues.getIssueById(issueId);

    if (issue) {
      const issuePartial = pick(JSON.parse(JSON.stringify(issue)), [
        "id",
        "name",
        "state_id",
        "sort_order",
        "completed_at",
        "estimate_point",
        "priority",
        "start_date",
        "target_date",
        "sequence_id",
        "project_id",
        "parent_id",
        "created_at",
        "updated_at",
        "created_by",
        "updated_by",
        "is_draft",
        "archived_at",
        "state__group",
        "cycle_id",
        "link_count",
        "attachment_count",
        "sub_issues_count",
        "assignee_ids",
        "label_ids",
        "module_ids",
        "type_id",
      ]);
      updateIssue(issuePartial);
    }
  });
};

export const wrapDateTime = (field: string) => {
  const DATE_TIME_FIELDS = ["created_at", "updated_at", "completed_at", "start_date", "target_date"];

  if (DATE_TIME_FIELDS.includes(field)) {
    return `datetime(${field})`;
  }
  return field;
};

export const getGroupedIssueResults = (issueResults: (TIssue & { group_id: string; total_issues: number })[]): any => {
  const groupedResults: {
    [key: string]: {
      results: TIssue[];
      total_results: number;
    };
  } = {};

  for (const issue of issueResults) {
    const { group_id, total_issues } = issue;
    const groupId = group_id ? group_id : "None";
    if (groupedResults?.[groupId] !== undefined && Array.isArray(groupedResults?.[groupId]?.results)) {
      groupedResults?.[groupId]?.results.push(issue);
    } else {
      groupedResults[groupId] = { results: [issue], total_results: total_issues };
    }
  }

  return groupedResults;
};

export const getSubGroupedIssueResults = (
  issueResults: (TIssue & { group_id: string; total_issues: number; sub_group_id: string })[]
): any => {
  const subGroupedResults: {
    [key: string]: {
      results: {
        [key: string]: {
          results: TIssue[];
          total_results: number;
        };
      };
      total_results: number;
    };
  } = {};

  for (const issue of issueResults) {
    const { group_id, total_issues, sub_group_id } = issue;
    const groupId = group_id ? group_id : "None";
    const subGroupId = sub_group_id ? sub_group_id : "None";

    if (subGroupedResults?.[groupId] === undefined) {
      subGroupedResults[groupId] = { results: {}, total_results: 0 };
    }

    if (
      subGroupedResults[groupId].results[subGroupId] !== undefined &&
      Array.isArray(subGroupedResults[groupId].results[subGroupId]?.results)
    ) {
      subGroupedResults[groupId].results[subGroupId]?.results.push(issue);
    } else {
      subGroupedResults[groupId].results[subGroupId] = { results: [issue], total_results: total_issues };
    }
  }

  const groupByKeys = Object.keys(subGroupedResults);

  for (const groupByKey of groupByKeys) {
    let totalIssues = 0;
    const groupedResults = subGroupedResults[groupByKey]?.results ?? {};
    const subGroupByKeys = Object.keys(groupedResults);

    for (const subGroupByKey of subGroupByKeys) {
      const subGroupedResultsCount = groupedResults[subGroupByKey].total_results ?? 0;
      totalIssues += subGroupedResultsCount;
    }

    subGroupedResults[groupByKey].total_results = totalIssues;
  }

  return subGroupedResults;
};
