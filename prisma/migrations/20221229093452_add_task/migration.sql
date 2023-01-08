-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "alertDate" TIMESTAMP(3),
    "deadLineDate" TIMESTAMP(3),
    "groupMemberUserId" INTEGER NOT NULL,
    "groupMemberGroupId" INTEGER NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_groupMemberUserId_groupMemberGroupId_fkey" FOREIGN KEY ("groupMemberUserId", "groupMemberGroupId") REFERENCES "GroupMember"("userId", "groupId") ON DELETE RESTRICT ON UPDATE CASCADE;
