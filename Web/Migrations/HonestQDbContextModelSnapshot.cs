﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Pobs.Domain;

namespace Pobs.Web.Migrations
{
    [DbContext(typeof(HonestQDbContext))]
    partial class HonestQDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.1.0-rtm-30799")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);

            modelBuilder.Entity("Pobs.Domain.Entities.Answer", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<DateTimeOffset>("PostedAt");

                    b.Property<int>("PostedByUserId");

                    b.Property<int>("QuestionId");

                    b.Property<string>("Slug")
                        .IsRequired()
                        .HasMaxLength(280);

                    b.Property<string>("Source")
                        .HasColumnType("VARCHAR(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                        .HasMaxLength(2000);

                    b.Property<string>("Text")
                        .IsRequired()
                        .HasColumnType("VARCHAR(280) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL")
                        .HasMaxLength(280);

                    b.HasKey("Id");

                    b.HasIndex("PostedByUserId");

                    b.HasIndex("QuestionId");

                    b.ToTable("Answer");
                });

            modelBuilder.Entity("Pobs.Domain.Entities.Comment", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("AgreementRating");

                    b.Property<int>("AnswerId");

                    b.Property<bool>("IsAnonymous");

                    b.Property<long?>("ParentCommentId");

                    b.Property<DateTimeOffset>("PostedAt");

                    b.Property<int>("PostedByUserId");

                    b.Property<string>("Source")
                        .HasColumnType("VARCHAR(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                        .HasMaxLength(2000);

                    b.Property<int>("Status");

                    b.Property<string>("Text")
                        .IsRequired()
                        .HasColumnType("VARCHAR(280) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL")
                        .HasMaxLength(280);

                    b.HasKey("Id");

                    b.HasIndex("AnswerId");

                    b.HasIndex("ParentCommentId");

                    b.HasIndex("PostedByUserId");

                    b.ToTable("Comment");
                });

            modelBuilder.Entity("Pobs.Domain.Entities.Question", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<DateTimeOffset>("PostedAt");

                    b.Property<int>("PostedByUserId");

                    b.Property<string>("Slug")
                        .IsRequired()
                        .HasMaxLength(280);

                    b.Property<string>("Source")
                        .HasColumnType("VARCHAR(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                        .HasMaxLength(2000);

                    b.Property<int>("Status");

                    b.Property<string>("Text")
                        .IsRequired()
                        .HasColumnType("VARCHAR(280) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL")
                        .HasMaxLength(280);

                    b.HasKey("Id");

                    b.HasIndex("PostedByUserId");

                    b.ToTable("Question");
                });

            modelBuilder.Entity("Pobs.Domain.Entities.QuestionTag", b =>
                {
                    b.Property<int>("QuestionId");

                    b.Property<int>("TagId");

                    b.HasKey("QuestionId", "TagId");

                    b.HasIndex("TagId");

                    b.ToTable("QuestionTag");
                });

            modelBuilder.Entity("Pobs.Domain.Entities.Reaction", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int?>("AnswerId");

                    b.Property<long?>("CommentId");

                    b.Property<DateTimeOffset>("PostedAt");

                    b.Property<int>("PostedByUserId");

                    b.Property<int>("Type");

                    b.HasKey("Id");

                    b.HasIndex("PostedByUserId");

                    b.HasIndex("AnswerId", "PostedByUserId", "Type")
                        .IsUnique();

                    b.HasIndex("CommentId", "PostedByUserId", "Type")
                        .IsUnique();

                    b.ToTable("Reaction");
                });

            modelBuilder.Entity("Pobs.Domain.Entities.Tag", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Description")
                        .HasColumnType("VARCHAR(280) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                        .HasMaxLength(280);

                    b.Property<bool>("IsApproved");

                    b.Property<string>("MoreInfoUrl")
                        .HasMaxLength(2000);

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL")
                        .HasMaxLength(100);

                    b.Property<DateTime>("PostedAt");

                    b.Property<int>("PostedByUserId");

                    b.Property<string>("Slug")
                        .IsRequired()
                        .HasMaxLength(100);

                    b.HasKey("Id");

                    b.HasIndex("PostedByUserId");

                    b.HasIndex("Slug")
                        .IsUnique();

                    b.ToTable("Tag");
                });

            modelBuilder.Entity("Pobs.Domain.Entities.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<DateTimeOffset>("CreatedAt");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL")
                        .HasMaxLength(100);

                    b.Property<string>("EmailVerificationToken")
                        .HasMaxLength(32);

                    b.Property<byte[]>("PasswordHash")
                        .IsRequired()
                        .HasMaxLength(64);

                    b.Property<byte[]>("PasswordSalt")
                        .IsRequired()
                        .HasMaxLength(128);

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasColumnType("VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL")
                        .HasMaxLength(100);

                    b.HasKey("Id");

                    b.HasIndex("Email")
                        .IsUnique();

                    b.HasIndex("Username")
                        .IsUnique();

                    b.ToTable("User");
                });

            modelBuilder.Entity("Pobs.Domain.Entities.Answer", b =>
                {
                    b.HasOne("Pobs.Domain.Entities.User", "PostedByUser")
                        .WithMany()
                        .HasForeignKey("PostedByUserId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("Pobs.Domain.Entities.Question", "Question")
                        .WithMany("Answers")
                        .HasForeignKey("QuestionId")
                        .OnDelete(DeleteBehavior.Restrict);
                });

            modelBuilder.Entity("Pobs.Domain.Entities.Comment", b =>
                {
                    b.HasOne("Pobs.Domain.Entities.Answer", "Answer")
                        .WithMany("Comments")
                        .HasForeignKey("AnswerId")
                        .OnDelete(DeleteBehavior.Restrict);

                    b.HasOne("Pobs.Domain.Entities.Comment", "ParentComment")
                        .WithMany("ChildComments")
                        .HasForeignKey("ParentCommentId")
                        .OnDelete(DeleteBehavior.Restrict);

                    b.HasOne("Pobs.Domain.Entities.User", "PostedByUser")
                        .WithMany()
                        .HasForeignKey("PostedByUserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Pobs.Domain.Entities.Question", b =>
                {
                    b.HasOne("Pobs.Domain.Entities.User", "PostedByUser")
                        .WithMany()
                        .HasForeignKey("PostedByUserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Pobs.Domain.Entities.QuestionTag", b =>
                {
                    b.HasOne("Pobs.Domain.Entities.Question", "Question")
                        .WithMany("QuestionTags")
                        .HasForeignKey("QuestionId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("Pobs.Domain.Entities.Tag", "Tag")
                        .WithMany("QuestionTags")
                        .HasForeignKey("TagId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Pobs.Domain.Entities.Reaction", b =>
                {
                    b.HasOne("Pobs.Domain.Entities.Answer", "Answer")
                        .WithMany("Reactions")
                        .HasForeignKey("AnswerId");

                    b.HasOne("Pobs.Domain.Entities.Comment", "Comment")
                        .WithMany("Reactions")
                        .HasForeignKey("CommentId");

                    b.HasOne("Pobs.Domain.Entities.User", "PostedByUser")
                        .WithMany()
                        .HasForeignKey("PostedByUserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Pobs.Domain.Entities.Tag", b =>
                {
                    b.HasOne("Pobs.Domain.Entities.User", "PostedByUser")
                        .WithMany("Tags")
                        .HasForeignKey("PostedByUserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });
#pragma warning restore 612, 618
        }
    }
}
