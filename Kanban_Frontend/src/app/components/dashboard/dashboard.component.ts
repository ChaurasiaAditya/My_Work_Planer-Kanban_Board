import {Component, Inject, OnInit} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {KanbanService} from "../../services/kanban.service";
import {Kanban} from "../../model/kanban/Kanban";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {Board} from "../../model/kanban/Board";
import {Column} from "../../model/kanban/Column";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {Task} from "../../model/kanban/Task";

export interface DialogData {
  boardName: string;
  columnName: string;
  taskName: string;
  taskDescription: string;
  taskPriority: string;
  taskStatus: string;
  taskStartDate: Date;
  taskDueDate: Date;
  taskAssignee: string;

}

export interface TaskDetails{

}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  currentUserKanban?: Kanban;
  boardToDisplay?: Board;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private kanbanService: KanbanService,
    public dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.kanbanService.getKanbanByEmail();
    setTimeout(() => {
      this.currentUserKanban = this.kanbanService.currentUserKanban;
      console.log(this.currentUserKanban);
    }, 1000);
  }

  addBoardToKanban() {
    const dialogRef = this.dialog.open(AddBoardPopupDialog, {
      width: '250px',
      data: {boardName: ''}
    });
    dialogRef.afterClosed().subscribe({
      next: (result: string) => {
        this.currentUserKanban?.boards?.push({boardName: result, columns: [], members: []});
        this.kanbanService.updateKanban(this.currentUserKanban!);
      }
    });
  }

  addColumnToBoard(board: Board) {
    const dialogRef = this.dialog.open(AddColumnPopupDialog, {
      width: '250px',
      data: {columnName: ''}
    });
    dialogRef.afterClosed().subscribe({
      next: (result: string) => {
        this.currentUserKanban?.boards?.forEach((b: Board) => {
          if (b.boardName === board.boardName) {
            b.columns?.push({columnName: result, tasks: []});
          }
        });
        this.kanbanService.updateKanban(this.currentUserKanban!);
      }
    })
  }

  addTaskToColumn(column: Column) {
    const dialogRef = this.dialog.open(AddTaskPopupDialog, {
      width: '250px',
      data: {
        taskName: '',
        taskDescription: '',
        taskAssignee: '',
        taskStartDate: '',
        taskDueDate: '',
        taskPriority: '',
        taskStatus: ''}
    });
    dialogRef.afterClosed().subscribe({
      next: (result : DialogData) => {
        this.currentUserKanban?.boards?.forEach((b: Board) => {
          if (b.boardName === this.boardToDisplay?.boardName) {
            b.columns?.forEach((c: any) => {
              if (c.columnName === column.columnName) {
                c.tasks?.push({
                  name: result.taskName,
                  description: result.taskDescription,
                  assigneeEmail: result.taskAssignee,
                  startDate: result.taskStartDate,
                  dueDate: result.taskDueDate,
                  priority: result.taskPriority,
                  status: result.taskStatus});
              }
            });
          }
        });
        this.kanbanService.updateKanban(this.currentUserKanban!);
      }
    })
  }

  displayBoard(board: Board) {
    this.boardToDisplay = board;
  }

  drop(event: CdkDragDrop<Task[] | undefined>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data!, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data!,
        event.container.data!,
        event.previousIndex!,
        event.currentIndex!,
      );
    }
    this.kanbanService.updateKanban(this.currentUserKanban!);
  }
}

@Component({
  selector: 'add-board-popup',
  templateUrl: './add-board-popup.html'
})
export class AddBoardPopupDialog {
  constructor(public dialogRef: MatDialogRef<AddBoardPopupDialog>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) {
  }

  onNoClick() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'add-column-popup',
  templateUrl: './add-column-popup.html'
})
export class AddColumnPopupDialog {
  constructor(public dialogRef: MatDialogRef<AddColumnPopupDialog>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) {
  }

  onNoClick() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'add-task-popup',
  templateUrl: './add-task-popup.html'
})
export class AddTaskPopupDialog {
  constructor(public dialogRef: MatDialogRef<AddTaskPopupDialog>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) {
  }

  onNoClick() {
    this.dialogRef.close();
  }
}
