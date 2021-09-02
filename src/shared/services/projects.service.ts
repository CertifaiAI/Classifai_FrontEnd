import { Injectable } from '@angular/core';
import { ProjectStatsResponse, project_stats } from 'shared/types/message/message.model';

@Injectable({
    providedIn: 'root',
})
export class ProjectsService {
    currentProjectStats: project_stats = {
        project_name: '',
        labeled_image: 0,
        unlabeled_image: 0,
        label_Per_Class_In_Project: [],
    };

    constructor() {}

    setCurrentProjecrStats = (projectStat: project_stats) => {
        this.currentProjectStats = projectStat;
    };

    getCurrentProjecrStats = () => {
        return this.currentProjectStats;
    };
}
