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

                    b.Property<long?>("ParentCommentId");

                    b.Property<DateTimeOffset>("PostedAt");

                    b.Property<int>("PostedByUserId");

                    b.Property<string>("Source")
                        .HasColumnType("VARCHAR(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                        .HasMaxLength(2000);

                    b.Property<string>("Text")
                        .HasColumnType("VARCHAR(280) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
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

                    b.Property<string>("Text")
                        .IsRequired()
                        .HasColumnType("VARCHAR(280) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL")
                        .HasMaxLength(280);

                    b.HasKey("Id");

                    b.HasIndex("PostedByUserId");

                    b.ToTable("Question");
                });

            modelBuilder.Entity("Pobs.Domain.Entities.QuestionTopic", b =>
                {
                    b.Property<int>("QuestionId");

                    b.Property<int>("TopicId");

                    b.HasKey("QuestionId", "TopicId");

                    b.HasIndex("TopicId");

                    b.ToTable("QuestionTopic");
                });

            modelBuilder.Entity("Pobs.Domain.Entities.Topic", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

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

                    b.Property<string>("Summary")
                        .HasColumnType("VARCHAR(280) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                        .HasMaxLength(280);

                    b.HasKey("Id");

                    b.HasIndex("PostedByUserId");

                    b.HasIndex("Slug")
                        .IsUnique();

                    b.ToTable("Topic");
                });

            modelBuilder.Entity("Pobs.Domain.Entities.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("FirstName")
                        .IsRequired()
                        .HasMaxLength(50);

                    b.Property<string>("LastName")
                        .IsRequired()
                        .HasMaxLength(50);

                    b.Property<byte[]>("PasswordHash")
                        .IsRequired()
                        .HasMaxLength(64);

                    b.Property<byte[]>("PasswordSalt")
                        .IsRequired()
                        .HasMaxLength(128);

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasMaxLength(50);

                    b.HasKey("Id");

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

            modelBuilder.Entity("Pobs.Domain.Entities.QuestionTopic", b =>
                {
                    b.HasOne("Pobs.Domain.Entities.Question", "Question")
                        .WithMany("QuestionTopics")
                        .HasForeignKey("QuestionId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("Pobs.Domain.Entities.Topic", "Topic")
                        .WithMany("QuestionTopics")
                        .HasForeignKey("TopicId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Pobs.Domain.Entities.Topic", b =>
                {
                    b.HasOne("Pobs.Domain.Entities.User", "PostedByUser")
                        .WithMany("Topics")
                        .HasForeignKey("PostedByUserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });
#pragma warning restore 612, 618
        }
    }
}
